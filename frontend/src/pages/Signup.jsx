import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/signup.css';
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

function Signup() {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [refresh, setRefresh] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Password:', password);
    };

    return (
        <motion.div
            className="signup-container"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
      <Link to="/" style={{ position: 'absolute', top: '20px', right: '20px', color: '#009189', textDecoration: 'none', fontSize: '18px' }}>
        {t("← Back to Home")}
      </Link>      <button 
        onClick={() => { i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en'); setRefresh(refresh + 1); }}
        style={{ position: 'absolute', top: '50px', right: '20px', background: '#009189', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
      >
        {i18n.language === 'en' ? 'FR' : 'EN'}
      </button>      <div className="signup-right">
                <h2 style={{ color: "white", fontSize: "50px" }}>{t("Welcome Back!")}</h2>
                <p style={{ color: "white", marginBottom: "40px" }}>{t("To keep connected with us please login with your personal info")}</p>
                <Link to="/login" className="signIn-button">{t("Sign In")}</Link>
            </div>
            <div className="signup-left">
                <h2 style={{ color: "#009189", fontSize: "50px" }}>{t("Create Account")}</h2>
                <div className="social-signup">
                    <button className="social-button">F</button>
                    <button className="social-button">G</button>
                    <button className="social-button">in</button>
                </div>
                <p style={{ color: "grey" }}>{t("or use your email for registration:")}</p>
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <input
                            type="text"
                            id="name"
                            placeholder={t('Name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit" className="signup-button">{t("Sign Up")}</button>
                </form>
            </div>
        </motion.div>
    );
}

export default Signup;