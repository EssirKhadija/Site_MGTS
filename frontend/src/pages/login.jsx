import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/login.css';
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (

    <motion.div
      className="login-container"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to="/" style={{ position: 'absolute', top: '20px', left: '20px', color: '#009189', textDecoration: 'none', fontSize: '18px' }}>
        {t("← Back to Home")}
      </Link>
      <button 
        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en')}
        style={{ position: 'absolute', top: '50px', left: '20px', background: '#009189', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
      >
        {i18n.language === 'en' ? 'FR' : 'EN'}
      </button>
      <div className="login-left">
        <h2 style={{ color: "#009189", fontSize: "50px" }}>{t("Sign in")}</h2>
        <div className="social-login">
          <button className="social-button">F</button>
          <button className="social-button">G</button>
          <button className="social-button">in</button>
        </div>
        <p style={{ color: "grey" }}>{t("or use your email account:")}</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              id="email"
              placeholder={t('Email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder={t('Password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <a href="#" className="forgot-password">{t("Forgot your password?")}</a>
          <Link to="/client-dashboard" style={{ textDecoration: 'none' }}>
            <button type="submit" className="login-button">{t("Sign In")}</button>
          </Link>
        </form>
      </div>
      <div className="login-right">
        <h2 style={{ color: "white", fontSize: "50px" }}>{t("Hello!")}</h2>
        <p style={{ color: "white", marginTop: "8px", marginBottom: "40px" }}>{t("Enter your personal details and start your journey with us")}</p>
        <Link to="/signup" className="signup-button">
          {t("Sign Up")}
        </Link>
      </div>
    </motion.div>
  );
}

export default Login;
