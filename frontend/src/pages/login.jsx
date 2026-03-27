import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { useAuth } from "../context/AuthContext";

const ROLE_ROUTES = {
  admin: "/admin",
  client: "/client-dashboard",
  supplier: "/supplier",
  transport: "/transport",
  transitaire: "/transitaire",
};

function Login() {
  const { t } = useTranslation();
  const { login, loginWith2FA } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [totpToken, setTotpToken] = useState("");

  // ── LOGIN ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password });

      /*
      if (result.requires2FA) {
        setRequires2FA(true);
        setUserId(result.userId);
      }
      */
      // redirect handled in handle2FA or here if no 2FA
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ── 2FA VERIFY ─────────────────────────────────────────────
  const handle2FA = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWith2FA(userId, totpToken);
      // loginWith2FA sets user in context → trigger redirect below
    } catch (err) {
      setError(err.message || "Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };

  // ── REDIRECT after user set in context ────────────────────
  const { user } = useAuth();
  React.useEffect(() => {
    if (user) {
      navigate(ROLE_ROUTES[user.role] || "/");
    }
  }, [user]);

  // ── 2FA SCREEN ─────────────────────────────────────────────
  if (requires2FA) {
    return (
      <motion.div
        className="login-container"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="login-left">
          <h2 style={{ color: "#009189", fontSize: "40px" }}>
            {t("Two-Factor Authentication")}
          </h2>
          <p style={{ color: "grey", marginBottom: "20px" }}>
            {t("Enter the code from your authenticator app")}
          </p>

          {error && (
            <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
          )}

          <form onSubmit={handle2FA} className="login-form">
            <div className="form-group">
              <input
                type="text"
                placeholder={t("6-digit code")}
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? t("Verifying...") : t("Verify")}
            </button>
          </form>

          <button
            onClick={() => {
              setRequires2FA(false);
              setError("");
            }}
            style={{
              marginTop: "15px",
              background: "none",
              border: "none",
              color: "#009189",
              cursor: "pointer",
            }}
          >
            {t("← Back")}
          </button>
        </div>

        <div className="login-right">
          <h2 style={{ color: "white", fontSize: "50px" }}>{t("Hello!")}</h2>
          <p style={{ color: "white", marginTop: "8px" }}>
            {t("Enter your personal details and start your journey with us")}
          </p>
        </div>
      </motion.div>
    );
  }

  // ── LOGIN SCREEN ───────────────────────────────────────────
  return (
    <motion.div
      className="login-container"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to="/"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#009189",
          textDecoration: "none",
          fontSize: "18px",
        }}
      >
        {t("← Back to Home")}
      </Link>
      <button
        onClick={() =>
          i18n.changeLanguage(i18n.language === "en" ? "fr" : "en")
        }
        style={{
          position: "absolute",
          top: "50px",
          left: "20px",
          background: "#009189",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {i18n.language === "en" ? "FR" : "EN"}
      </button>

      <div className="login-left">
        <h2 style={{ color: "#009189", fontSize: "50px" }}>{t("Sign in")}</h2>

        {error && (
          <p style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder={t("Email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder={t("Password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Link to="/forgot-password" className="forgot-password">
            {t("Forgot your password?")}
          </Link>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? t("Signing in...") : t("Sign In")}
          </button>
        </form>
      </div>

      <div className="login-right">
        <h2 style={{ color: "white", fontSize: "50px" }}>{t("Hello!")}</h2>
        <p style={{ color: "white", marginTop: "8px", marginBottom: "40px" }}>
          {t("Enter your personal details and start your journey with us")}
        </p>
        <Link to="/signup" className="signup-button">
          {t("Sign Up")}
        </Link>
      </div>
    </motion.div>
  );
}

export default Login;
