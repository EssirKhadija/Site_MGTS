import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/signup.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { authAPI } from "../api/auth.api";

function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [refresh, setRefresh] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.register({
        fullName: name,
        email,
        phone: telephone,
        password,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ─────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        className="signup-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            textAlign: "center",
            padding: "40px",
          }}
        >
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>✅</div>
          <h2
            style={{ color: "#009189", fontSize: "32px", marginBottom: "10px" }}
          >
            {t("Account Created!")}
          </h2>
          <p style={{ color: "grey", marginBottom: "30px", maxWidth: "400px" }}>
            {t("A verification email has been sent to")}{" "}
            <strong>{email}</strong>.
            {t(
              " Please check your inbox and verify your account before logging in."
            )}
          </p>
          <Link to="/login" className="signIn-button">
            {t("Go to Login")}
          </Link>
        </div>
      </motion.div>
    );
  }

  // ── SIGNUP SCREEN ──────────────────────────────────────────
  return (
    <motion.div
      className="signup-container"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to="/"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          color: "#009189",
          textDecoration: "none",
          fontSize: "18px",
        }}
      >
        {t("← Back to Home")}
      </Link>
      <button
        onClick={() => {
          i18n.changeLanguage(i18n.language === "en" ? "fr" : "en");
          setRefresh(refresh + 1);
        }}
        style={{
          position: "absolute",
          top: "50px",
          right: "20px",
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

      <div className="signup-right">
        <h2 style={{ color: "white", fontSize: "50px" }}>
          {t("Welcome Back!")}
        </h2>
        <p style={{ color: "white", marginBottom: "40px" }}>
          {t("To keep connected with us please login with your personal info")}
        </p>
        <Link to="/login" className="signIn-button">
          {t("Sign In")}
        </Link>
      </div>

      <div className="signup-left">
        <h2 style={{ color: "#009189", fontSize: "50px" }}>
          {t("Create Account")}
        </h2>

        {error && (
          <p style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <input
              type="text"
              placeholder={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              type="tel"
              placeholder={t("Phone Number")}
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
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
              minLength={8}
            />
          </div>

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? t("Creating account...") : t("Sign Up")}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default Signup;
