import React from 'react';
import '../../styles/Home.css';
import logo from '../../assets/logo1.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" />
      </div>
      <ul className="navbar-menu">
        <li><a href="#accueil">Accueil</a></li>
        <li><a href="#apropos">À Propos</a></li>
        <li><a href="#services">Nos Services</a></li>
        <li><a href="#solutions">Nos Solutions</a></li>
        <li><a href="#contact">Nous Contacter</a></li>
      </ul>
      <div className="navbar-buttons">
        <button className="btn-get-in-touch">GET IN TOUCH</button>
      </div>
    </nav>
  );
};

export default Navbar;
