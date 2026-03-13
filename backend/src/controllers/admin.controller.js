const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { sendCredentialsEmail } = require('../services/email.service');
const { success, created, badRequest, notFound } = require('../utils/response');

// ── CREATE USER ───────────────────────────────────────────────
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role, companyName, factoryName, productTypes } = req.body;

    const allowedRoles = ['supplier', 'transport', 'transitaire'];
    if (!allowedRoles.includes(role)) {
      return badRequest(res, 'Admin can only create: supplier, transport, transitaire');
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return badRequest(res, 'Email already in use');

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO users (fullName, email, phone, password, role, status, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, hashedPassword, role, 'active', true]
    );
    const userId = result.insertId;

    if (role === 'supplier') {
      await pool.query(
        'INSERT INTO fournisseurs (user_id, factoryName, productTypes) VALUES (?, ?, ?)',
        [userId, factoryName || '', productTypes || '']
      );
    } else if (role === 'transport') {
      await pool.query(
        'INSERT INTO transporteurs (user_id, companyName) VALUES (?, ?)',
        [userId, companyName || '']
      );
    } else if (role === 'transitaire') {
      await pool.query(
        'INSERT INTO transitaires (user_id, companyName) VALUES (?, ?)',
        [userId, companyName || '']
      );
    }

    await sendCredentialsEmail(email, fullName, password);

    return created(res, { id: userId, email, role }, 'User created and credentials sent by email');
  } catch (err) {
    next(err);
  }
};

// ── GET ALL USERS ─────────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (role)   { conditions.push('role = ?');   params.push(role); }
    if (status) { conditions.push('status = ?'); params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [users] = await pool.query(
      `SELECT id, fullName, email, phone, role, status, isVerified, createdAt
       FROM users
       ${where}
       ORDER BY createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users ${where}`, params
    );

    return success(res, { users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// ── GET USER BY ID ────────────────────────────────────────────
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT u.id, u.fullName, u.email, u.phone, u.role, u.status, u.isVerified, u.createdAt,
         f.factoryName, f.productTypes,
         t.companyName AS transportCompany,
         tr.companyName AS transitaireCompany
       FROM users u
       LEFT JOIN fournisseurs f  ON u.id = f.user_id
       LEFT JOIN transporteurs t ON u.id = t.user_id
       LEFT JOIN transitaires tr ON u.id = tr.user_id
       WHERE u.id = ?`,
      [id]
    );

    if (rows.length === 0) return notFound(res, 'User not found');
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── UPDATE USER ───────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, status, companyName, factoryName, productTypes } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return notFound(res, 'User not found');

    const user = rows[0];

    await pool.query(
      'UPDATE users SET fullName = ?, phone = ?, status = ? WHERE id = ?',
      [
        fullName || user.fullName,
        phone    || user.phone,
        status   || user.status,
        id
      ]
    );

    // Update role-specific info
    if (user.role === 'supplier' && (factoryName || productTypes)) {
      await pool.query(
        'UPDATE fournisseurs SET factoryName = ?, productTypes = ? WHERE user_id = ?',
        [factoryName || '', productTypes || '', id]
      );
    }
    if (user.role === 'transport' && companyName) {
      await pool.query('UPDATE transporteurs SET companyName = ? WHERE user_id = ?', [companyName, id]);
    }
    if (user.role === 'transitaire' && companyName) {
      await pool.query('UPDATE transitaires SET companyName = ? WHERE user_id = ?', [companyName, id]);
    }

    // Notify user if suspended
    if (status === 'suspended') {
      await pool.query(
        'INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)',
        [id, 'Compte suspendu', 'Votre compte a été suspendu par l\'administrateur.']
      );
    }

    return success(res, null, 'User updated');
  } catch (err) {
    next(err);
  }
};

// ── DELETE USER ───────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return notFound(res, 'User not found');
    if (rows[0].role === 'admin') return badRequest(res, 'Cannot delete admin');

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return success(res, null, 'User deleted');
  } catch (err) {
    next(err);
  }
};

// ── DASHBOARD STATS ───────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {

    // Users count by role
    const [userStats] = await pool.query(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );

    // Orders count by status
    const [orderStats] = await pool.query(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    );

    // Total revenue (validated payments)
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue 
       FROM payments WHERE status = 'validated'`
    );

    // Total MGTS margin
    const [[{ totalMargin }]] = await pool.query(
      `SELECT COALESCE(SUM(mgtsMargin), 0) as totalMargin FROM order_totals`
    );

    // Orders this month
    const [[{ ordersThisMonth }]] = await pool.query(
      `SELECT COUNT(*) as ordersThisMonth FROM orders
       WHERE MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW())`
    );

    // Revenue this month
    const [[{ revenueThisMonth }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as revenueThisMonth FROM payments
       WHERE status = 'validated'
       AND MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW())`
    );

    // Last 6 months revenue chart
    const [revenueChart] = await pool.query(
      `SELECT 
         DATE_FORMAT(createdAt, '%Y-%m') as month,
         COALESCE(SUM(amount), 0) as revenue
       FROM payments
       WHERE status = 'validated'
       AND createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
       ORDER BY month ASC`
    );

    // Last 5 orders
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.type, o.status, o.createdAt,
         u.fullName AS clientName,
         ot.totalAmount
       FROM orders o
       JOIN users u ON o.client_id = u.id
       LEFT JOIN order_totals ot ON o.id = ot.order_id
       ORDER BY o.createdAt DESC
       LIMIT 5`
    );

    // Pending payments
    const [[{ pendingPayments }]] = await pool.query(
      `SELECT COUNT(*) as pendingPayments FROM payments WHERE status = 'pending'`
    );

    // Pending products
    const [[{ pendingProducts }]] = await pool.query(
      `SELECT COUNT(*) as pendingProducts FROM products WHERE status = 'pending'`
    );

    return success(res, {
      users: {
        byRole: userStats,
        total:  userStats.reduce((acc, r) => acc + r.count, 0),
      },
      orders: {
        byStatus:      orderStats,
        total:         orderStats.reduce((acc, r) => acc + r.count, 0),
        thisMonth:     ordersThisMonth,
      },
      revenue: {
        total:         totalRevenue,
        thisMonth:     revenueThisMonth,
        totalMargin,
        chart:         revenueChart,
      },
      pending: {
        payments:      pendingPayments,
        products:      pendingProducts,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
};

// ── EXPORT DATA (Excel-ready JSON) ────────────────────────────
exports.exportOrders = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    let where = '';
    const params = [];

    if (from && to) {
      where = 'WHERE o.createdAt BETWEEN ? AND ?';
      params.push(from, to);
    }

    const [orders] = await pool.query(
      `SELECT 
         o.id, o.type, o.status, o.quantity, o.incoterm, o.createdAt,
         u.fullName AS client, u.email AS clientEmail,
         s.fullName AS supplier,
         t.fullName AS transport,
         tr.fullName AS transitaire,
         ot.productionCost, ot.transportCost, ot.customsCost, ot.mgtsMargin, ot.totalAmount,
         p.status AS paymentStatus, p.transferReference
       FROM orders o
       JOIN users u ON o.client_id = u.id
       LEFT JOIN users s  ON o.supplier_id    = s.id
       LEFT JOIN users t  ON o.transport_id   = t.id
       LEFT JOIN users tr ON o.transitaire_id = tr.id
       LEFT JOIN order_totals ot ON o.id = ot.order_id
       LEFT JOIN payments p      ON o.id = p.order_id
       ${where}
       ORDER BY o.createdAt DESC`,
      params
    );

    // Set headers for Excel download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="mgts_orders_export.json"');

    return success(res, orders);
  } catch (err) {
    next(err);
  }
};