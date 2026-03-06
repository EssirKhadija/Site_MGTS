import React from 'react';
import { FaPlane, FaTruck, FaShip } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../../styles/Home.css';
import trspAer from '../../assets/trspAer.png'; 
import trspTer from '../../assets/trspTerr.png';
import trspMari from '../../assets/trspMari.png';

const Solutions = () => {
  const { t } = useTranslation();
  const solutions = [
    {
      id: 1,
      icon: FaPlane,
      title: t("Transport Aérien"),
      description: t("Rapidité et Efficacité"),
      details: t("Livraison express pour les envois urgents. Couverture mondiale avec partenaires fiables."),
      image: trspAer,
      color: '#009189'
    },
    {
      id: 2,
      icon: FaTruck,
      title: t("Transport Terrestre"),
      description: t("Flexibilité et Proximité"),
      details: t("Solutions adaptées à vos besoins. Suivi en temps réel de vos expéditions."),
      image: trspTer,
      color: '#004E9B'
    },
    {
      id: 3,
      icon: FaShip,
      title: t("Transport Maritime"),
      description: t("Solution pour gros volumes"),
      details: t("Tarifs compétitifs pour les conteneurs. Manutention sécurisée et assurance complète."),
      image: trspMari,
      color: '#1F2A5C'
    }
  ];

  return (
    <section className="solutions-section" id="solutions">
      <div className="solutions-header">
        <h2>{t("Des solutions logistiques complètes et diversifiées, soutenues par notre Contrôle Qualité")}</h2>
        <p>
          {t("Que vous soyez une PME ou un grand compte, nous mettons à votre disposition une expertise logistique complète, alliant contrôle qualité rigoureux et capacités de distribution optimales, afin que vous disposiez d'une logistique nationale et internationale performante.")}
        </p>
      </div>

      <div className="solutions-grid">
        {solutions.map((solution) => {
          const Icon = solution.icon;
          return (
            <div key={solution.id} className="solution-card" style={{ backgroundImage: `url(${solution.image})` }}>
              <div className="solution-overlay">
                <div className="solution-icon-wrapper">
                  <Icon className="solution-icon" style={{ color: solution.color }} />
                </div>
              </div>

              <div className="solution-content">
                <h3 className="solution-title">{solution.title}</h3>
                <p className="solution-subtext">{solution.description}</p>
                <p className="solution-details">{solution.details}</p>
                <button className="btn-savoir-plus">En savoir plus</button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Solutions;
