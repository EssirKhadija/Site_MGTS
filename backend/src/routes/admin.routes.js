const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const admin = require("../controllers/admin.controller");
const order = require("../controllers/order.controller");
const product = require("../controllers/product.controller");
const payment = require("../controllers/payment.controller");

router.use(authenticate, authorize("admin"));

// ── Dashboard ─────────────────────────────────────────────────
router.get("/dashboard", admin.getDashboardStats);
router.get("/export/orders", admin.exportOrders);

// ── Users ─────────────────────────────────────────────────────
router.post("/users", admin.createUser);
router.get("/users", admin.getAllUsers);
router.get("/users/:id", admin.getUserById);
router.put("/users/:id", admin.updateUser);
router.delete("/users/:id", admin.deleteUser);

// ── Orders ────────────────────────────────────────────────────
router.get("/orders", order.getAllOrders);
router.get("/orders/:id", order.getOrderById);
router.post("/orders/:id/assign-supplier", order.assignSupplier);
router.post("/orders/:id/assign-transport", order.assignTransport);
router.post("/orders/:id/assign-transitaire", order.assignTransitaire);
router.post("/orders/:id/calculate", order.calculateTotal);

// ── Products ──────────────────────────────────────────────────
router.get("/products", product.getAllProducts);
router.post("/products/:id/review", product.reviewProduct);

// ── Payments ──────────────────────────────────────────────────
router.get("/payments", payment.getAllPayments);
router.post("/payments/:paymentId/validate", payment.validatePayment);
router.post("/payments/:paymentId/reject", payment.rejectPayment);
router.get("/orders/:orderId/invoice", payment.downloadInvoice);

module.exports = router;
