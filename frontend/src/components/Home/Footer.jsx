import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/Home.css';
import logo from '../../assets/logo1.png';
import { FaFacebook, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        <div className="footer-col footer-brand">
          <img src={logo} alt="Logo" className="footer-logo" />
          <p className="footer-desc">
            {t("Votre Agent de Sourcing basé en Chine, dédié aux sociétés marocaines. Importer de Chine vers le Maroc, en toute maîtrise.")}
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="WhatsApp"><FaPhoneAlt /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>{t("Services")}</h4>
          <ul>
            <li>{t("Sourcing de Produit")}</li>
            <li>{t("Inspection du Fabricant")}</li>
            <li>{t("Suivi de la Production")}</li>
            <li>{t("Consolidation des Colis")}</li>
            <li>{t("Contrôle Qualité")}</li>
            <li>{t("Douanes & Livraison")}</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t("Support")}</h4>
          <ul>
            <li>{t("À Propos")}</li>
            <li>{t("Notre Process")}</li>
            <li>{t("Solution par Secteur")}</li>
            <li>{t("Demander un Devis")}</li>
            <li>{t("Guides & Ressources")}</li>
          </ul>
        </div>
        <div className="footer-col footer-contact">
          <h4>{t("Contact")}</h4>
          <ul>
            <li><FaPhoneAlt className="footer-icon" /> {t("Bureau Maroc - Marrakech")}<br /><span className="footer-contact-info">+212 696-24-58-34</span></li>
            <li><FaPhoneAlt className="footer-icon" /> {t("Bureau Chine - Shenzen")}<br /><span className="footer-contact-info">+86 130-4347-8356</span></li>
            <li><FaEnvelope className="footer-icon" /> {t("Email")}<br /><span className="footer-contact-info">A.MGTS@gmail.com</span></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 MGTS.com – Tous Droits Réservés.</span>
        <div className="footer-links">
          <a href="#">Politique de Confidentialité</a>
          <a href="#">Conditions Générales</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
