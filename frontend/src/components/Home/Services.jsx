import React, { useEffect, useRef, useState } from 'react';
import { FaSearch, FaCheckSquare, FaClipboard, FaBox, FaPassport, FaTruck } from 'react-icons/fa';
import '../../styles/Home.css';

const Services = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => [...prev, entry.target.getAttribute('data-service-id')]);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = containerRef.current?.querySelectorAll('.service-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      id: 1,
      icon: FaSearch,
      title: 'Sourcing de Produit',
      description: 'Recherche et sélection de fournisseurs fiables à l\'internationale.'
    },
    {
      id: 2,
      icon: FaCheckSquare,
      title: 'Inspection de l\'Entrepôt Fournisseur',
      description: 'Vérification de la qualité et conformité avant expédition.'
    },
    {
      id: 3,
      icon: FaClipboard,
      title: 'Suivi de la Réalisation de la Commande',
      description: 'Contrôle continu du processus de production et respect des détails.'
    },
    {
      id: 4,
      icon: FaBox,
      title: 'Exploitation des Colis Expédition',
      description: 'Organisation et optimisation de vos envois internationaux.'
    },
    {
      id: 5,
      icon: FaPassport,
      title: 'Dédouanement',
      description: 'Gestion complète des procédures douanières au Maroc.'
    },
    {
      id: 6,
      icon: FaTruck,
      title: 'Transport & Livraison',
      description: 'Acheminement sécurisé de vos marchandises jusqu\'à destination finale.'
    }
  ];

  return (
    <section className="services-section">
      <div className="services-header">
        <h1>Comment peut-on vous Aider ?</h1>
        <p>Notre équipe dédiée est là pour vous accompagner à chaque étape de vos envois internationaux.</p>
      </div>

      <div className="services-grid" ref={containerRef}>
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              data-service-id={service.id}
              className={`service-card ${visibleCards.includes(String(service.id)) ? 'visible' : ''}`}
            >
              <div className="service-icon-circle">
                <Icon />
              </div>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-description">{service.description}</p>
            </div>
          );
        })}
      </div>

      <div className="services-button-container">
        <button className="btn-devis">DEMANDER UN DEVIS EN 24H</button>
      </div>
    </section>
  );
};

export default Services;
