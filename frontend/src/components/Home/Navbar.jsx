import React from 'react';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../../styles/Home.css';
import logo from '../../assets/logo1.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" />
        </div>
        <ul className="navbar-menu">
          <li><a href="#hero">{t("Accueil")}</a></li>
          <li><a href="#a-propos">{t("À Propos")}</a></li>
          <li><a href="#services">{t("Nos Services")}</a></li>
          <li><a href="#solutions">{t("Nos Solutions")}</a></li>
          <li><a href="#footer">{t("Nous Contacter")}</a></li>
        </ul>
        <div className="navbar-buttons">
          <Link to="/login">
            <button className="btn-get-in-touch">{t("GET IN TOUCH")}</button>
          </Link>
        </div>
      </nav>
      <div className="language-switcher">
        <button onClick={toggleLanguage} className="btn-language">
          <FaGlobe /> {i18n.language.toUpperCase()}
        </button>
      </div>
    </>
  );
};

export default Navbar;
