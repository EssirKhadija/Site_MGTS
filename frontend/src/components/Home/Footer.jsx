import React from 'react';
import '../../styles/Home.css';
import logo from '../../assets/logo1.png';
import { FaFacebook, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col footer-brand">
          <img src={logo} alt="Logo" className="footer-logo" />
          <p className="footer-desc">
            Votre Agent de Sourcing basé en Chine, dédié aux sociétés marocaines. Importer de Chine vers le Maroc, en toute maîtrise.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="WhatsApp"><FaPhoneAlt /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            <li>Sourcing de Produit</li>
            <li>Inspection du Fabricant</li>
            <li>Suivi de la Production</li>
            <li>Consolidation des Colis</li>
            <li>Contrôle Qualité</li>
            <li>Douanes & Livraison</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li>À Propos</li>
            <li>Notre Process</li>
            <li>Solution par Secteur</li>
            <li>Demander un Devis</li>
            <li>Guides & Ressources</li>
          </ul>
        </div>
        <div className="footer-col footer-contact">
          <h4>Contact</h4>
          <ul>
            <li><FaPhoneAlt className="footer-icon" /> Bureau Maroc - Marrakech<br /><span className="footer-contact-info">+212 696-24-58-34</span></li>
            <li><FaPhoneAlt className="footer-icon" /> Bureau Chine - Shenzen<br /><span className="footer-contact-info">+86 130-4347-8356</span></li>
            <li><FaEnvelope className="footer-icon" /> Email<br /><span className="footer-contact-info">A.MGTS@gmail.com</span></li>
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
