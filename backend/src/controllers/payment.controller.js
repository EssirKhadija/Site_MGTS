const { pool } = require('../config/db');
const { generateInvoicePDF } = require('../services/pdf.service');
const { sendOrderStatusEmail } = require('../services/email.service');
const { success, created, badRequest, notFound, forbidden } = require('../utils/response');

// ── CLIENT: SUBMIT PAYMENT INFO ───────────────────────────────
exports.submitPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const clientId = req.user.id;
    const {
      bankName, accountHolder, iban,
      swiftCode, transferReference, currency
    } = req.body;

    // Verify order belongs to client and is in correct status
    const [order] = await pool.query(
      `SELECT o.*, ot.totalAmount 
       FROM orders o 
       JOIN order_totals ot ON o.id = ot.order_id
       WHERE o.id = ? AND o.client_id = ? AND o.status = 'waiting_validation'`,
      [orderId, clientId]
    );
    if (order.length === 0) {
      return notFound(res, 'Order not found or not ready for payment');
    }

    const proofFile = req.file ? req.file.path : null;

    // Upsert payment
    const [existing] = await pool.query('SELECT id FROM payments WHERE order_id = ?', [orderId]);

    let paymentId;
    if (existing.length > 0) {
      await pool.query(
        `UPDATE payments SET bankName=?, accountHolder=?, iban=?, swiftCode=?,
         transferReference=?, currency=?, status='pending' WHERE order_id=?`,
        [bankName, accountHolder, iban, swiftCode, transferReference, currency || 'MAD', orderId]
      );
      paymentId = existing[0].id;
    } else {
      const [result] = await pool.query(
        `INSERT INTO payments 
          (order_id, client_id, amount, paymentMethod, currency, bankName, accountHolder, iban, swiftCode, transferReference, status)
         VALUES (?, ?, ?, 'virement', ?, ?, ?, ?, ?, ?, 'pending')`,
        [orderId, clientId, order[0].totalAmount, currency || 'MAD',
         bankName, accountHolder, iban, swiftCode, transferReference]
      );
      paymentId = result.insertId;
    }

    // Save proof file if uploaded
    if (proofFile) {
      await pool.query(
        'INSERT INTO bank_transfer_proofs (payment_id, proofFilePath) VALUES (?, ?)',
        [paymentId, proofFile]
      );
    }

    await pool.query(`UPDATE orders SET status = 'waiting_validation' WHERE id = ?`, [orderId]);

    // Notify admin
    await pool.query(
      `INSERT INTO notifications (user_id, title, content)
       SELECT id, ?, ? FROM users WHERE role = 'admin'`,
      [`Paiement reçu #${orderId}`, `Le client a soumis un virement pour la commande #${orderId}`]
    );

    return created(res, { paymentId }, 'Payment submitted. Waiting for admin validation.');
  } catch (err) {
    next(err);
  }
};

// ── CLIENT: UPLOAD PROOF (separate endpoint) ──────────────────
exports.uploadProof = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const clientId = req.user.id;

    if (!req.file) return badRequest(res, 'No file uploaded');

    const [payment] = await pool.query(
      `SELECT p.id FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.order_id = ? AND o.client_id = ?`,
      [orderId, clientId]
    );
    if (payment.length === 0) return notFound(res, 'Payment not found');

    await pool.query(
      'INSERT INTO bank_transfer_proofs (payment_id, proofFilePath) VALUES (?, ?)',
      [payment[0].id, req.file.path]
    );

    return success(res, null, 'Proof uploaded successfully');
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: GET ALL PAYMENTS ───────────────────────────────────
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = '';
    const params = [];
    if (status) {
      where = 'WHERE p.status = ?';
      params.push(status);
    }

    const [payments] = await pool.query(
      `SELECT p.*,
         u.fullName AS clientName, u.email AS clientEmail,
         o.type AS orderType,
         btp.proofFilePath
       FROM payments p
       JOIN users u  ON p.client_id  = u.id
       JOIN orders o ON p.order_id   = o.id
       LEFT JOIN bank_transfer_proofs btp ON btp.payment_id = p.id
       ${where}
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM payments p ${where}`, params
    );

    return success(res, { payments, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: VALIDATE PAYMENT ───────────────────────────────────
exports.validatePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const [payment] = await pool.query(
      `SELECT p.*, o.client_id, u.email, u.fullName
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN users u  ON o.client_id = u.id
       WHERE p.id = ?`,
      [paymentId]
    );
    if (payment.length === 0) return notFound(res, 'Payment not found');

    const p = payment[0];

    await pool.query(`UPDATE payments SET status = 'validated' WHERE id = ?`, [paymentId]);
    await pool.query(`UPDATE orders   SET status = 'paid'      WHERE id = ?`, [p.order_id]);

    // Notify client
    await pool.query(
      'INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)',
      [p.client_id, `Paiement validé #${p.order_id}`, 'Votre paiement a été validé par MGTS.']
    );
    await sendOrderStatusEmail(p.email, p.fullName, p.order_id, 'Paiement validé ✅');

    return success(res, null, 'Payment validated');
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: REJECT PAYMENT ─────────────────────────────────────
exports.rejectPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const [payment] = await pool.query(
      `SELECT p.*, o.client_id, u.email, u.fullName
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN users u  ON o.client_id = u.id
       WHERE p.id = ?`,
      [paymentId]
    );
    if (payment.length === 0) return notFound(res, 'Payment not found');

    const p = payment[0];

    await pool.query(`UPDATE payments SET status = 'rejected' WHERE id = ?`, [paymentId]);
    await pool.query(`UPDATE orders SET status = 'waiting_validation' WHERE id = ?`, [p.order_id]);

    await pool.query(
      'INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)',
      [p.client_id, `Paiement refusé #${p.order_id}`, reason || 'Votre paiement a été refusé. Veuillez soumettre à nouveau.']
    );
    await sendOrderStatusEmail(p.email, p.fullName, p.order_id, 'Paiement refusé ❌');

    return success(res, null, 'Payment rejected');
  } catch (err) {
    next(err);
  }
};

// ── CLIENT/ADMIN: DOWNLOAD INVOICE ───────────────────────────
exports.downloadInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [rows] = await pool.query(
      `SELECT o.*,
         u.fullName AS clientName, u.email AS clientEmail, u.phone AS clientPhone,
         ot.productionCost, ot.transportCost, ot.customsCost, ot.mgtsMargin, ot.totalAmount,
         p.status AS paymentStatus, p.transferReference, p.currency
       FROM orders o
       JOIN users u        ON o.client_id  = u.id
       JOIN order_totals ot ON o.id        = ot.order_id
       LEFT JOIN payments p ON o.id        = p.order_id
       WHERE o.id = ?`,
      [orderId]
    );

    if (rows.length === 0) return notFound(res, 'Order not found');
    const order = rows[0];

    // Access control
    if (role === 'client' && order.client_id !== userId) return forbidden(res);

    // Only allow invoice download if paid
    if (!['paid', 'validated'].includes(order.paymentStatus) && role !== 'admin') {
      return badRequest(res, 'Invoice available only after payment validation');
    }

    const pdfBuffer = await generateInvoicePDF(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="MGTS_Invoice_${orderId}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};