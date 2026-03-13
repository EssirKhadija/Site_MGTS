const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const message = require("../controllers/message.controller");

router.use(authenticate);

// Messages
router.post("/orders/:orderId", message.sendMessage);
router.get("/orders/:orderId", message.getMessagesByOrder);
router.get("/unread", message.getUnreadCount);

// Notifications
router.get("/notifications", message.getNotifications);
router.put("/notifications/read", message.markNotificationsRead);

module.exports = router;
