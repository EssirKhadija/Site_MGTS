const { pool } = require('../config/db');
const { success, created, badRequest, notFound, forbidden } = require('../utils/response');

// ── SEND MESSAGE ──────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    const role = req.user.role;

    if (!content || content.trim() === '') {
      return badRequest(res, 'Message content is required');
    }

    // Verify user has access to this order
    const hasAccess = await _checkOrderAccess(orderId, senderId, role);
    if (!hasAccess) return forbidden(res, 'You do not have access to this order');

    const [result] = await pool.query(
      'INSERT INTO messages (order_id, sender_id, content) VALUES (?, ?, ?)',
      [orderId, senderId, content.trim()]
    );

    const [newMessage] = await pool.query(
      `SELECT m.*, u.fullName AS senderName, u.role AS senderRole
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${orderId}`).emit('new_message', newMessage[0]);
    }

    // Notify other participants
    await _notifyParticipants(orderId, senderId, newMessage[0].senderName);

    return created(res, newMessage[0], 'Message sent');
  } catch (err) {
    next(err);
  }
};

// ── GET MESSAGES BY ORDER ─────────────────────────────────────
exports.getMessagesByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const hasAccess = await _checkOrderAccess(orderId, userId, role);
    if (!hasAccess) return forbidden(res, 'You do not have access to this order');

    const [messages] = await pool.query(
      `SELECT m.*, u.fullName AS senderName, u.role AS senderRole
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.order_id = ?
       ORDER BY m.createdAt ASC`,
      [orderId]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE messages SET isRead = TRUE 
       WHERE order_id = ? AND sender_id != ? AND isRead = FALSE`,
      [orderId, userId]
    );

    return success(res, messages);
  } catch (err) {
    next(err);
  }
};

// ── GET UNREAD COUNT ──────────────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN orders o ON m.order_id = o.id
       WHERE m.sender_id != ? AND m.isRead = FALSE
       AND (
         o.client_id      = ? OR
         o.supplier_id    = ? OR
         o.transport_id   = ? OR
         o.transitaire_id = ?
       )`,
      [userId, userId, userId, userId, userId]
    );

    return success(res, { unreadCount: count });
  } catch (err) {
    next(err);
  }
};

// ── GET NOTIFICATIONS ─────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY createdAt DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [userId]
    );

    const [[{ unread }]] = await pool.query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND isRead = FALSE',
      [userId]
    );

    return success(res, { notifications, total, unread, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
};

// ── MARK NOTIFICATIONS AS READ ────────────────────────────────
exports.markNotificationsRead = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET isRead = TRUE WHERE user_id = ? AND isRead = FALSE',
      [req.user.id]
    );
    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

// ── HELPERS ───────────────────────────────────────────────────
const _checkOrderAccess = async (orderId, userId, role) => {
  if (role === 'admin') return true;

  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (rows.length === 0) return false;

  const order = rows[0];
  return (
    order.client_id      === userId ||
    order.supplier_id    === userId ||
    order.transport_id   === userId ||
    order.transitaire_id === userId
  );
};

const _notifyParticipants = async (orderId, senderId, senderName) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (rows.length === 0) return;

  const order = rows[0];
  const title = `Nouveau message - Commande #${orderId}`;
  const content = `${senderName} vous a envoyé un message.`;

  // Collect all participant IDs except sender
  const participantIds = [
    order.client_id,
    order.supplier_id,
    order.transport_id,
    order.transitaire_id,
  ].filter(id => id && id !== senderId);

  // Add admins
  const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin"');
  admins.forEach(a => {
    if (a.id !== senderId) participantIds.push(a.id);
  });

  // Insert notifications
  for (const userId of [...new Set(participantIds)]) {
    await pool.query(
      'INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)',
      [userId, title, content]
    );
  }
};