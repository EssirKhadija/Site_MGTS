const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const product = require('../controllers/product.controller');

// Public product listing → clients + admin
router.get('/',    authenticate, authorize('client', 'admin'), product.getAllProducts);
router.get('/:id', authenticate, authorize('client', 'admin', 'supplier'), product.getProductById);

module.exports = router;