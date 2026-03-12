const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

module.exports = (io) => {
  // Authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, email, role }
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `🟢 Socket connected: user ${socket.user.id} (${socket.user.role})`
    );

    // ── JOIN ORDER ROOM ──────────────────────────────────────
    socket.on("join_order", async (orderId) => {
      const hasAccess = await _checkAccess(
        orderId,
        socket.user.id,
        socket.user.role
      );
      if (!hasAccess) {
        socket.emit("error", { message: "Access denied to this order" });
        return;
      }
      socket.join(`order_${orderId}`);
      socket.emit("joined_order", { orderId });
      console.log(`👤 User ${socket.user.id} joined order_${orderId}`);
    });

    // ── LEAVE ORDER ROOM ─────────────────────────────────────
    socket.on("leave_order", (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`👤 User ${socket.user.id} left order_${orderId}`);
    });

    // ── TYPING INDICATOR ─────────────────────────────────────
    socket.on("typing", ({ orderId }) => {
      socket.to(`order_${orderId}`).emit("user_typing", {
        userId: socket.user.id,
        role: socket.user.role,
      });
    });

    socket.on("stop_typing", ({ orderId }) => {
      socket.to(`order_${orderId}`).emit("user_stop_typing", {
        userId: socket.user.id,
      });
    });

    // ── DISCONNECT ───────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: user ${socket.user.id}`);
    });
  });

  const _checkAccess = async (orderId, userId, role) => {
    if (role === "admin") return true;
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);
    if (rows.length === 0) return false;
    const o = rows[0];
    return (
      o.client_id === userId ||
      o.supplier_id === userId ||
      o.transport_id === userId ||
      o.transitaire_id === userId
    );
  };
};
