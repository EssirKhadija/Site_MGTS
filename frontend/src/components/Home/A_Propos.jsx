import React, { useEffect } from 'react';
import { FaHandshake, FaCheckCircle, FaTruck } from 'react-icons/fa';
import '../../styles/Home.css';
import image4 from '../../assets/image4.png';
import image5 from '../../assets/image5.png';

const Services = () => {

  useEffect(() => {

    const elements = document.querySelectorAll(
      ".a-propos-card, .extra-images, .extra-text"
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.2 });

    elements.forEach(el => observer.observe(el));

  }, []);

  const a_propos = [
    {
      id: 1,
      icon: FaHandshake,
      title: 'Négocié au Meilleur Coût',
      description: 'Usines vérifiées, Prix / MOQ / Délais optimisés.'
    },
    {
      id: 2,
      icon: FaCheckCircle,
      title: 'Qualité Contrôlée (AQL)',
      description: 'Pré-expédition avec photos/vidéos & checklist signée.'
    },
    {
      id: 3,
      icon: FaTruck,
      title: 'DDP tout Inclus',
      description: 'Fret, droits & taxes, dédouanement, livraison chez vous.'
    }
  ];

  return (
    <section className="a-propos">

      <div className="a-propos-container">
        {a_propos.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.id} className="a-propos-card">

              <div className="a-propos-icon">
                <Icon />
              </div>

              <h3 className="a-propos-title">
                {item.title}
              </h3>

              <p className="a-propos-description">
                {item.description}
              </p>

            </div>
          );
        })}
      </div>

      <div className="a-propos-extra">

        <div className="extra-images">
          <img src={image4} alt="Main building" className="extra-img-large" />
          <img src={image5} alt="Secondary building" className="extra-img-small" />
        </div>

        <div className="extra-text">

          <h2>Ce qui nous distingue</h2>

          <h3>
            Le partenaire Chine→Maroc qui sécurise vos marges
          </h3>

          <p>
            Agent de sourcing basé en Chine, nous alignons prix, délais et conformité pour livrer en DDP jusqu'à votre entrepôt — avec des preuves de qualité à chaque étape.
          </p>

          <ul>
            <li>Négociation experte</li>
            <li>Qualité AQL prouvée</li>
            <li>DDP tout inclus</li>
            <li>Devis 24h (FR/EN)</li>
          </ul>

        </div>

      </div>

    </section>
  );
};

export default Services;