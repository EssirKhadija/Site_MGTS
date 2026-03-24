const router = require("express").Router();
const { authLimiter } = require("../middlewares/security.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const auth = require("../controllers/auth.controller");

router.post("/register", authLimiter, auth.register);
router.get("/verify-email/:token", auth.verifyEmail);
router.post("/login", authLimiter, auth.login);
router.post("/verify-2fa", authLimiter, auth.verify2FA);
router.post("/refresh-token", auth.refreshToken);
router.post("/logout", auth.logout);
router.post("/forgot-password", authLimiter, auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);
router.get("/me", authenticate, auth.getMe);
router.post("/setup-2fa", authenticate, auth.setup2FA);
router.post("/enable-2fa", authenticate, auth.enable2FA);
router.put("/profile", authenticate, auth.updateProfile);
router.put("/change-password", authenticate, auth.changePassword);

module.exports = router;
