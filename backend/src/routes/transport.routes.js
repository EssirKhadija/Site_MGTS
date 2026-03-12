const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const order = require("../controllers/order.controller");

router.use(authenticate, authorize("transport"));

router.get("/orders", order.getMyOrders);
router.get("/orders/:id", order.getOrderById);
router.post("/orders/:id/quote", order.addTransportQuote);

module.exports = router;
