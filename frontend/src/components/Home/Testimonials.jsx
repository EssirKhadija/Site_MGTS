import React from 'react';
import { FaStar, FaQuoteRight } from 'react-icons/fa';
import '../../styles/Home.css';
import profile1 from '../../assets/profile1.png';
import profile2 from '../../assets/profile2.png';
import profile3 from '../../assets/profile3.png';
import profile4 from '../../assets/profile4.png';
import profile5 from '../../assets/profile5.png';
import profile6 from '../../assets/profile6.png';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      rating: 5,
      category: 'Sourcing Import',
      text: 'Excellent service ! Ils ont trouvé les meilleurs fournisseurs en Chine avec les meilleures prix. Une équipe très professionnelle et réactive.',
      name: 'Ahmed Hassan',
      image: profile2
    },
    {
      id: 2,
      rating: 5,
      category: 'Qualité & Inspection',
      text: 'La vérification qualité était impeccable. Ils ont détecté des défauts avant expédition. Un vrai gain de temps et d\'argent pour nous.',
      name: 'Fatima Bennani',
      image: profile1
    },
    {
      id: 3,
      rating: 5,
      category: 'Dédouanement',
      text: 'Processus sans tracas, tous les documents étaient en ordre. Livraison rapide directement à notre entrépôt. Très satisfaits!',
      name: 'Mohammed Lebrini',
      image: profile3
    },
    {
      id: 4,
      rating: 5,
      category: 'Transport & Logistique',
      text: 'Partenaire fiable pour les envois internationaux. Tarifs compétitifs et suivi en temps réel. Je recommande vivement.',
      name: 'Sara Alaoui',
      image: profile4
    },
    {
      id: 5,
      rating: 5,
      category: 'Sourcing Complet',
      text: 'Une solution complète du sourcing à la livraison. Réduction masquée des coûts de 30%. Parfait pour notre business.',
      name: 'Karim Mansouri',
      image: profile6
    },
    {
      id: 6,
      rating: 5,
      category: 'Négociation',
      text: 'Excellente négociation avec les fournisseurs. Ils ont obtenu les meilleures conditions pour nous. Bravo à l\'équipe!',
      name: 'Nadia Tahiri',
      image: profile5
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: rating }, (_, i) => (
      <FaStar key={i} className="star" />
    ));
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <p className="testimonials-label">TESTIMONIALS</p>
        <h2>What Our Clients Say</h2>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="testimonial-top">
              <div className="stars-rating">
                {renderStars(testimonial.rating)}
              </div>
              <FaQuoteRight className="quote-icon" />
            </div>

            <p className="testimonial-category">{testimonial.category}</p>
            <p className="testimonial-text">{testimonial.text}</p>

            <div className="testimonial-author">
              <img src={testimonial.image} alt={testimonial.name} className="author-avatar" />
              <p className="author-name">{testimonial.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
