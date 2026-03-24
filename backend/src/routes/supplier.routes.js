const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");
const product = require("../controllers/product.controller");
const order = require("../controllers/order.controller");

router.use(authenticate, authorize("supplier"));

// ── Products ──────────────────────────────────────────────────
router.post("/products", upload.array("images", 10), product.createProduct);
router.get("/products", product.getMyProducts);
router.put("/products/:id", upload.array("images", 10), product.updateProduct);
router.delete("/products/:id", product.deleteProduct);

// ── Orders ────────────────────────────────────────────────────
router.get("/orders", order.getMyOrders);
router.get("/orders/:id", order.getOrderById);
router.post("/orders/:id/quote", order.addSupplierQuote);

module.exports = router;
