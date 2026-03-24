const { pool } = require("../config/db");
const { sendOrderStatusEmail } = require("../services/email.service");
const {
  success,
  created,
  badRequest,
  notFound,
  forbidden,
} = require("../utils/response");

// ── CREATE ORDER (client) ─────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const {
      type,
      product_id,
      description,
      quantity,
      dimensions,
      material,
      estimatedBudget,
      incoterm,
    } = req.body;

    if (!["existing_product", "custom"].includes(type)) {
      return badRequest(res, "type must be existing_product or custom");
    }
    if (type === "existing_product" && !product_id) {
      return badRequest(
        res,
        "product_id is required for existing_product orders"
      );
    }

    const attachmentPdf = req.file ? req.file.path : null;

    const [result] = await pool.query(
      `INSERT INTO orders 
        (client_id, product_id, type, description, quantity, dimensions, material, estimatedBudget, incoterm, attachmentPdf, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        clientId,
        product_id || null,
        type,
        description,
        quantity,
        dimensions,
        material,
        estimatedBudget,
        incoterm,
        attachmentPdf,
      ]
    );

    // Notify admin
    await _notifyUser(
      null,
      "admin",
      `Nouvelle commande #${result.insertId}`,
      `Un client a créé une nouvelle commande.`
    );

    return created(
      res,
      { orderId: result.insertId },
      "Order created successfully"
    );
  } catch (err) {
    next(err);
  }
};

// ── GET MY ORDERS (client) ────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    const roleColumn = {
      client: "o.client_id",
      supplier: "o.supplier_id",
      transport: "o.transport_id",
      transitaire: "o.transitaire_id",
    };

    const column = roleColumn[role];
    if (!column) return forbidden(res);

    const [orders] = await pool.query(
      `SELECT o.*,
         p.name AS productName,
         ot.totalAmount, ot.mgtsMargin,
         ot.productionCost, ot.transportCost, ot.customsCost,
         sq.productionCost  AS myQuote,
         tq.transportCost   AS myTransportQuote,
         trq.customsCost    AS myCustomsQuote,
         uc.fullName AS clientName,
         us.fullName AS supplierName
       FROM orders o
       LEFT JOIN products p           ON o.product_id    = p.id
       LEFT JOIN order_totals ot      ON o.id            = ot.order_id
       LEFT JOIN supplier_quotes sq   ON o.id            = sq.order_id
       LEFT JOIN transport_quotes tq  ON o.id            = tq.order_id
       LEFT JOIN transitaire_quotes trq ON o.id          = trq.order_id
       LEFT JOIN users uc ON o.client_id   = uc.id
       LEFT JOIN users us ON o.supplier_id = us.id
       WHERE ${column} = ?
       ORDER BY o.createdAt DESC`,
      [id]
    );

    return success(res, orders);
  } catch (err) {
    next(err);
  }
};

// ── GET ORDER DETAIL ──────────────────────────────────────────
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [rows] = await pool.query(
      `SELECT o.*,
        p.name AS productName,
        sq.productionCost, sq.comment AS supplierComment,
        tq.transportCost,
        trq.customsCost,
        ot.totalAmount, ot.mgtsMargin, ot.productionCost AS totalProduction,
        ot.transportCost AS totalTransport, ot.customsCost AS totalCustoms
       FROM orders o
       LEFT JOIN products p       ON o.product_id    = p.id
       LEFT JOIN supplier_quotes sq  ON o.id = sq.order_id
       LEFT JOIN transport_quotes tq ON o.id = tq.order_id
       LEFT JOIN transitaire_quotes trq ON o.id = trq.order_id
       LEFT JOIN order_totals ot   ON o.id = ot.order_id
       WHERE o.id = ?`,
      [id]
    );

    if (rows.length === 0) return notFound(res, "Order not found");
    const order = rows[0];

    // Access control
    if (role === "client" && order.client_id !== userId) return forbidden(res);
    if (role === "supplier" && order.supplier_id !== userId)
      return forbidden(res);
    if (role === "transport" && order.transport_id !== userId)
      return forbidden(res);
    if (role === "transitaire" && order.transitaire_id !== userId)
      return forbidden(res);

    return success(res, order);
  } catch (err) {
    next(err);
  }
};

// ── ASSIGN SUPPLIER (admin) ───────────────────────────────────
exports.assignSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { supplier_id } = req.body;

    const [order] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (order.length === 0) return notFound(res, "Order not found");

    await pool.query(
      `UPDATE orders SET supplier_id = ?, status = 'pending_supplier' WHERE id = ?`,
      [supplier_id, id]
    );

    // Notify supplier
    await _notifyUser(
      supplier_id,
      null,
      `Nouvelle demande #${id}`,
      `Une commande vous a été assignée.`
    );

    return success(res, null, "Supplier assigned");
  } catch (err) {
    next(err);
  }
};

// ── SUPPLIER ADDS QUOTE ───────────────────────────────────────
exports.addSupplierQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productionCost, comment } = req.body;
    const supplierId = req.user.id;

    const [order] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND supplier_id = ?",
      [id, supplierId]
    );
    if (order.length === 0)
      return notFound(res, "Order not found or not assigned to you");

    // Upsert supplier quote
    await pool.query(
      `INSERT INTO supplier_quotes (order_id, supplier_id, productionCost, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE productionCost = VALUES(productionCost), comment = VALUES(comment)`,
      [id, supplierId, productionCost, comment]
    );

    await pool.query(
      `UPDATE orders SET status = 'pending_transport' WHERE id = ?`,
      [id]
    );

    // Notify admin
    await _notifyUser(
      null,
      "admin",
      `Devis fournisseur #${id}`,
      `Le fournisseur a soumis son devis.`
    );

    return success(res, null, "Supplier quote submitted");
  } catch (err) {
    next(err);
  }
};

// ── ASSIGN TRANSPORT (admin) ──────────────────────────────────
exports.assignTransport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transport_id } = req.body;

    await pool.query(
      `UPDATE orders SET transport_id = ?, status = 'pending_transport' WHERE id = ?`,
      [transport_id, id]
    );

    await _notifyUser(
      transport_id,
      null,
      `Nouvelle commande #${id}`,
      `Une commande vous a été assignée.`
    );

    return success(res, null, "Transport assigned");
  } catch (err) {
    next(err);
  }
};

// ── TRANSPORT ADDS QUOTE ──────────────────────────────────────
exports.addTransportQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transportCost } = req.body;
    const transportId = req.user.id;

    const [order] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND transport_id = ?",
      [id, transportId]
    );
    if (order.length === 0)
      return notFound(res, "Order not found or not assigned to you");

    await pool.query(
      `INSERT INTO transport_quotes (order_id, transport_id, transportCost)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE transportCost = VALUES(transportCost)`,
      [id, transportId, transportCost]
    );

    await pool.query(
      `UPDATE orders SET status = 'pending_transitaire' WHERE id = ?`,
      [id]
    );
    await _notifyUser(
      null,
      "admin",
      `Devis transport #${id}`,
      `Le transporteur a soumis son devis.`
    );

    return success(res, null, "Transport quote submitted");
  } catch (err) {
    next(err);
  }
};

// ── ASSIGN TRANSITAIRE (admin) ────────────────────────────────
exports.assignTransitaire = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transitaire_id } = req.body;

    await pool.query(
      `UPDATE orders SET transitaire_id = ?, status = 'pending_transitaire' WHERE id = ?`,
      [transitaire_id, id]
    );

    await _notifyUser(
      transitaire_id,
      null,
      `Nouvelle commande #${id}`,
      `Une commande vous a été assignée.`
    );

    return success(res, null, "Transitaire assigned");
  } catch (err) {
    next(err);
  }
};

// ── TRANSITAIRE ADDS QUOTE ────────────────────────────────────
exports.addTransitaireQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customsCost } = req.body;
    const transitaireId = req.user.id;

    const [order] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND transitaire_id = ?",
      [id, transitaireId]
    );
    if (order.length === 0)
      return notFound(res, "Order not found or not assigned to you");

    await pool.query(
      `INSERT INTO transitaire_quotes (order_id, transitaire_id, customsCost)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE customsCost = VALUES(customsCost)`,
      [id, transitaireId, customsCost]
    );

    await pool.query(
      `UPDATE orders SET status = 'final_calculation' WHERE id = ?`,
      [id]
    );
    await _notifyUser(
      null,
      "admin",
      `Devis transitaire #${id}`,
      `Le transitaire a soumis ses frais douaniers.`
    );

    return success(res, null, "Transitaire quote submitted");
  } catch (err) {
    next(err);
  }
};

// ── ADMIN CALCULATES FINAL TOTAL ──────────────────────────────
exports.calculateTotal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mgtsMargin } = req.body;

    const [sq] = await pool.query(
      "SELECT productionCost FROM supplier_quotes  WHERE order_id = ?",
      [id]
    );
    const [tq] = await pool.query(
      "SELECT transportCost  FROM transport_quotes  WHERE order_id = ?",
      [id]
    );
    const [trq] = await pool.query(
      "SELECT customsCost    FROM transitaire_quotes WHERE order_id = ?",
      [id]
    );

    if (!sq.length || !tq.length || !trq.length) {
      return badRequest(
        res,
        "All quotes (supplier, transport, transitaire) must be submitted first"
      );
    }

    const productionCost = parseFloat(sq[0].productionCost);
    const transportCost = parseFloat(tq[0].transportCost);
    const customsCost = parseFloat(trq[0].customsCost);
    const margin = parseFloat(mgtsMargin) || 0;
    const totalAmount = productionCost + transportCost + customsCost + margin;

    await pool.query(
      `INSERT INTO order_totals (order_id, productionCost, transportCost, customsCost, mgtsMargin, totalAmount)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         productionCost = VALUES(productionCost), transportCost = VALUES(transportCost),
         customsCost = VALUES(customsCost), mgtsMargin = VALUES(mgtsMargin), totalAmount = VALUES(totalAmount)`,
      [id, productionCost, transportCost, customsCost, margin, totalAmount]
    );

    await pool.query(
      `UPDATE orders SET status = 'pending_payment' WHERE id = ?`,
      [id]
    );

    // Notify client
    const [order] = await pool.query(
      "SELECT o.client_id, u.email, u.fullName FROM orders o JOIN users u ON o.client_id = u.id WHERE o.id = ?",
      [id]
    );
    if (order.length) {
      await _notifyUser(
        order[0].client_id,
        null,
        `Devis final prêt #${id}`,
        `Votre devis final est disponible.`
      );
      await sendOrderStatusEmail(
        order[0].email,
        order[0].fullName,
        id,
        "Devis final prêt"
      );
    }

    return success(res, {
      productionCost,
      transportCost,
      customsCost,
      mgtsMargin: margin,
      totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

// ── CLIENT ACCEPTS / REJECTS QUOTE ───────────────────────────
exports.respondToQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'accept' or 'reject'
    const clientId = req.user.id;

    if (!["accept", "reject"].includes(decision)) {
      return badRequest(res, "decision must be accept or reject");
    }

    const [order] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND client_id = ? AND status = ?",
      [id, clientId, "pending_payment"]
    );
    if (order.length === 0)
      return notFound(res, "Order not found or not in pending_payment status");

    const newStatus = decision === "accept" ? "waiting_validation" : "rejected";
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    if (decision === "accept") {
      await _notifyUser(
        null,
        "admin",
        `Devis accepté #${id}`,
        `Le client a accepté le devis.`
      );
    }

    return success(
      res,
      null,
      decision === "accept"
        ? "Quote accepted. Proceed to payment."
        : "Quote rejected."
    );
  } catch (err) {
    next(err);
  }
};

// ── GET ALL ORDERS (admin) ────────────────────────────────────
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = "";
    const params = [];
    if (status) {
      where = "WHERE o.status = ?";
      params.push(status);
    }

    const [orders] = await pool.query(
      `SELECT o.id, o.type, o.status, o.quantity, o.createdAt,
         u.fullName AS clientName, u.email AS clientEmail,
         p.name AS productName,
         ot.totalAmount
       FROM orders o
       JOIN users u ON o.client_id = u.id
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN order_totals ot ON o.id = ot.order_id
       ${where}
       ORDER BY o.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o ${where}`,
      params
    );

    return success(res, {
      orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
};

// ── HELPER: create notification ───────────────────────────────
const _notifyUser = async (userId, role, title, content) => {
  try {
    if (userId) {
      await pool.query(
        "INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)",
        [userId, title, content]
      );
    } else if (role) {
      const [admins] = await pool.query("SELECT id FROM users WHERE role = ?", [
        role,
      ]);
      for (const admin of admins) {
        await pool.query(
          "INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)",
          [admin.id, title, content]
        );
      }
    }
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};
