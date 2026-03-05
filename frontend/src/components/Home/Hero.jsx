import React from 'react';
import '../../styles/Home.css';
import Navbar from './Navbar.jsx';

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-wrapper">
        <Navbar />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          Importer de Chine vers le Maroc, en toute maîtrise
        </h1>
        <p className="hero-subtitle">
          Agent de sourcing basé en Chine, dédié aux sociétés marocaines : nous négocions vos achats, contrôlons la qualité, gérons les douanes et livrons jusqu'à votre entrépôt.
        </p>
        <div className="hero-buttons">
          <button className="btn-devis">DEMANDER UN DEVIS EN 24H</button>
          <button className="btn-whatsapp">PARLER SUR WHATSAPP</button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
