import React from 'react';
import './App.css';
import Hero from './components/Home/Hero';
import A_Propos from './components/Home/A_Propos';
import Services from './components/Home/Services';
import Testimonials from './components/Home/Testimonials';
import Solutions from './components/Home/Solutions';
import Footer from './components/Home/Footer';

function App() {
  return (
    <div className="App">
      <Hero />
      <A_Propos />
      <Services />
      <Testimonials />
      <Solutions />
      <div className="content">
        {/* Votre contenu principal ici */}
      </div>
      <Footer />
    </div>
  );
}

export default App;