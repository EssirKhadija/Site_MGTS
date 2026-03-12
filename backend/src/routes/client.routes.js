const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const order = require("../controllers/order.controller");
const upload = require("../middlewares/upload.middleware");
const payment = require("../controllers/payment.controller");
const upload = require("../middlewares/upload.middleware");

router.use(authenticate, authorize("client"));

router.post("/orders", upload.single("attachmentPdf"), order.createOrder);
router.get("/orders", order.getMyOrders);
router.get("/orders/:id", order.getOrderById);
router.post("/orders/:id/respond", order.respondToQuote);

router.post(
  "/orders/:orderId/payment",
  upload.single("proof"),
  payment.submitPayment
);
router.post(
  "/orders/:orderId/payment/proof",
  upload.single("proof"),
  payment.uploadProof
);
router.get("/orders/:orderId/invoice", payment.downloadInvoice);

module.exports = router;
