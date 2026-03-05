import React from 'react';
import './App.css';
import Hero from './components/Home/Hero';
import A_Propos from './components/Home/A_Propos';

function App() {
  return (
    <div className="App">
      <Hero />
      <A_Propos />
      <div className="content">
        {/* Votre contenu principal ici */}
      </div>
    </div>
  );
}

export default App;