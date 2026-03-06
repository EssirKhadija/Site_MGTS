import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/Home.css';
import Navbar from './Navbar.jsx';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="hero" id="hero">
      <div className="hero-wrapper">
        <Navbar />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          {t("Importer de Chine vers le Maroc, en toute maîtrise")}
        </h1>
        <p className="hero-subtitle">
          {t("Agent de sourcing basé en Chine, dédié aux sociétés marocaines : nous négocions vos achats, contrôlons la qualité, gérons les douanes et livrons jusqu'à votre entrépôt.")}
        </p>
        <div className="hero-buttons">
          <button className="btn-devis">{t("DEMANDER UN DEVIS EN 24H")}</button>
          <button className="btn-whatsapp">{t("PARLER SUR WHATSAPP")}</button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
