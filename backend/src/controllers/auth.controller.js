const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/db");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../services/jwt.service");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/email.service");
const {
  generate2FASecret,
  generate2FAQRCode,
  verify2FAToken,
} = require("../services/twofa.service");
const {
  success,
  created,
  badRequest,
  unauthorized,
  notFound,
  error,
} = require("../utils/response");

// ── REGISTER (clients only) ───────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return badRequest(res, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.query(
      "INSERT INTO users (fullName, email, phone, password, role, status, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [fullName, email, phone, hashedPassword, "client", "active", false]
    );

    const [newUser] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    const userId = newUser[0].id;

    // Email verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO email_verifications (user_id, token, expiresAt) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );

    await sendVerificationEmail(email, fullName, token);

    return created(res, null, "Account created. Please verify your email.");
  } catch (err) {
    next(err);
  }
};

// ── VERIFY EMAIL ──────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM email_verifications WHERE token = ? AND expiresAt > NOW()",
      [token]
    );
    if (rows.length === 0) {
      return badRequest(res, "Invalid or expired verification token");
    }

    const { user_id } = rows[0];
    await pool.query("UPDATE users SET isVerified = TRUE WHERE id = ?", [
      user_id,
    ]);
    await pool.query("DELETE FROM email_verifications WHERE token = ?", [
      token,
    ]);

    return success(res, null, "Email verified successfully");
  } catch (err) {
    next(err);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return unauthorized(res, "Invalid credentials");
    }

    const user = rows[0];

    if (!user.isVerified) {
      return unauthorized(res, "Please verify your email before logging in");
    }
    if (user.status === "pending") {
      return unauthorized(res, "Your account is pending admin approval");
    }
    if (user.status === "suspended") {
      return unauthorized(res, "Your account has been suspended");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return unauthorized(res, "Invalid credentials");
    }

    // 2FA check
    if (user.twofa_enabled) {
      return success(
        res,
        { requires2FA: true, userId: user.id },
        "2FA required"
      );
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expiresAt) VALUES (?, ?, ?)",
      [user.id, refreshToken, expiresAt]
    );

    return success(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── LOGIN WITH 2FA ────────────────────────────────────────────
exports.verify2FA = async (req, res, next) => {
  try {
    const { userId, totpToken } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0) return notFound(res, "User not found");

    const user = rows[0];
    const isValid = verify2FAToken(user.twofa_secret, totpToken);
    if (!isValid) return unauthorized(res, "Invalid 2FA code");

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expiresAt) VALUES (?, ?, ?)",
      [user.id, refreshToken, expiresAt]
    );

    return success(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── REFRESH TOKEN ─────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return badRequest(res, "Refresh token required");

    const [rows] = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = ? AND expiresAt > NOW()",
      [refreshToken]
    );
    if (rows.length === 0)
      return unauthorized(res, "Invalid or expired refresh token");

    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    return success(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

// ── LOGOUT ────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [
        refreshToken,
      ]);
    }
    return success(res, null, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      // Don't reveal if email exists
      return success(
        res,
        null,
        "If this email exists, a reset link has been sent"
      );
    }

    const user = rows[0];
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await pool.query("DELETE FROM password_resets WHERE user_id = ?", [
      user.id,
    ]);
    await pool.query(
      "INSERT INTO password_resets (user_id, token, expiresAt) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    );

    await sendPasswordResetEmail(email, user.fullName, token);

    return success(
      res,
      null,
      "If this email exists, a reset link has been sent"
    );
  } catch (err) {
    next(err);
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM password_resets WHERE token = ? AND expiresAt > NOW() AND usedAt IS NULL",
      [token]
    );
    if (rows.length === 0)
      return badRequest(res, "Invalid or expired reset token");

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      rows[0].user_id,
    ]);
    await pool.query(
      "UPDATE password_resets SET usedAt = NOW() WHERE token = ?",
      [token]
    );

    return success(res, null, "Password reset successfully");
  } catch (err) {
    next(err);
  }
};

// ── SETUP 2FA ─────────────────────────────────────────────────
exports.setup2FA = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    const user = rows[0];

    const secret = generate2FASecret(user.email);
    const qrCode = await generate2FAQRCode(secret.otpauth_url);

    // Save secret temporarily (not enabled until verified)
    await pool.query("UPDATE users SET twofa_secret = ? WHERE id = ?", [
      secret.base32,
      user.id,
    ]);

    return success(res, { qrCode, secret: secret.base32 });
  } catch (err) {
    next(err);
  }
};

// ── ENABLE 2FA ────────────────────────────────────────────────
exports.enable2FA = async (req, res, next) => {
  try {
    const { totpToken } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    const user = rows[0];

    const isValid = verify2FAToken(user.twofa_secret, totpToken);
    if (!isValid) return badRequest(res, "Invalid 2FA code");

    await pool.query("UPDATE users SET twofa_enabled = TRUE WHERE id = ?", [
      user.id,
    ]);
    return success(res, null, "2FA enabled successfully");
  } catch (err) {
    next(err);
  }
};

// ── GET ME ────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, fullName, email, phone, role, isVerified, status, twofa_enabled, createdAt FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return notFound(res, "User not found");
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};
