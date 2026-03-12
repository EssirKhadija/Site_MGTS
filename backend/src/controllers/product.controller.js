const { pool } = require('../config/db');
const { success, created, badRequest, notFound, forbidden } = require('../utils/response');

// ── CREATE PRODUCT (supplier) ─────────────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const supplierId = req.user.id;
    const { name, description, priceIndicatif, minQuantity } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map(f => f.path) : [];

    const [result] = await pool.query(
      `INSERT INTO products (supplier_id, name, description, priceIndicatif, minQuantity, images, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [supplierId, name, description, priceIndicatif || 0, minQuantity || 1, JSON.stringify(images)]
    );

    // Notify admin
    await pool.query(
      `INSERT INTO notifications (user_id, title, content)
       SELECT id, ?, ? FROM users WHERE role = 'admin'`,
      [`Nouveau produit #${result.insertId}`, `Le fournisseur a ajouté un nouveau produit en attente de validation.`]
    );

    return created(res, { productId: result.insertId }, 'Product created. Waiting for admin approval.');
  } catch (err) {
    next(err);
  }
};

// ── GET MY PRODUCTS (supplier) ────────────────────────────────
exports.getMyProducts = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE supplier_id = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    return success(res, products);
  } catch (err) {
    next(err);
  }
};

// ── GET ONE PRODUCT ───────────────────────────────────────────
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, u.fullName AS supplierName
       FROM products p
       JOIN users u ON p.supplier_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) return notFound(res, 'Product not found');

    // Supplier can only see his own
    if (req.user.role === 'supplier' && rows[0].supplier_id !== req.user.id) {
      return forbidden(res);
    }

    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── UPDATE PRODUCT (supplier) ─────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplierId = req.user.id;
    const { name, description, priceIndicatif, minQuantity } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND supplier_id = ?',
      [id, supplierId]
    );
    if (rows.length === 0) return notFound(res, 'Product not found');

    // New images if uploaded
    let images = rows[0].images;
    if (req.files && req.files.length > 0) {
      images = JSON.stringify(req.files.map(f => f.path));
    }

    await pool.query(
      `UPDATE products SET name=?, description=?, priceIndicatif=?, minQuantity=?, images=?, status='pending'
       WHERE id = ? AND supplier_id = ?`,
      [
        name        || rows[0].name,
        description || rows[0].description,
        priceIndicatif !== undefined ? priceIndicatif : rows[0].priceIndicatif,
        minQuantity    !== undefined ? minQuantity    : rows[0].minQuantity,
        images,
        id, supplierId
      ]
    );

    return success(res, null, 'Product updated. Waiting for admin re-approval.');
  } catch (err) {
    next(err);
  }
};

// ── DELETE PRODUCT (supplier) ─────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplierId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND supplier_id = ?',
      [id, supplierId]
    );
    if (rows.length === 0) return notFound(res, 'Product not found');

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return success(res, null, 'Product deleted');
  } catch (err) {
    next(err);
  }
};

// ── GET ALL PRODUCTS (admin + clients) ────────────────────────
exports.getAllProducts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const role = req.user.role;

    // Admin sees all, client sees only active
    let where = role === 'admin' ? '' : "WHERE p.status = 'active'";
    const params = [];

    if (role === 'admin' && status) {
      where = 'WHERE p.status = ?';
      params.push(status);
    }

    const [products] = await pool.query(
      `SELECT p.*, u.fullName AS supplierName
       FROM products p
       JOIN users u ON p.supplier_id = u.id
       ${where}
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM products p ${where}`, params
    );

    return success(res, { products, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: APPROVE / REJECT PRODUCT ──────────────────────────
exports.reviewProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(decision)) {
      return badRequest(res, 'decision must be approve or reject');
    }

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return notFound(res, 'Product not found');

    const newStatus = decision === 'approve' ? 'active' : 'inactive';
    await pool.query('UPDATE products SET status = ? WHERE id = ?', [newStatus, id]);

    // Notify supplier
    await pool.query(
      'INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)',
      [
        rows[0].supplier_id,
        `Produit ${decision === 'approve' ? 'approuvé ✅' : 'refusé ❌'} : ${rows[0].name}`,
        `Votre produit "${rows[0].name}" a été ${decision === 'approve' ? 'approuvé et publié' : 'refusé par l\'administrateur'}.`
      ]
    );

    return success(res, null, `Product ${newStatus}`);
  } catch (err) {
    next(err);
  }
};

// ── SUPPLIER: GET ASSIGNED ORDERS ────────────────────────────
exports.getSupplierOrders = async (req, res, next) => {
  try {
    const supplierId = req.user.id;

    const [orders] = await pool.query(
      `SELECT o.*,
         u.fullName AS clientName,
         p.name AS productName,
         sq.productionCost AS myQuote
       FROM orders o
       JOIN users u ON o.client_id = u.id
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN supplier_quotes sq ON o.id = sq.order_id AND sq.supplier_id = ?
       WHERE o.supplier_id = ?
       ORDER BY o.createdAt DESC`,
      [supplierId, supplierId]
    );

    return success(res, orders);
  } catch (err) {
    next(err);
  }
};