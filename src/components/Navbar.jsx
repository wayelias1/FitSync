import React, { useState } from 'react';
import '../styles/Navbar.css'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  return (
    <nav className="navbar-container">
      <div className='navbar-menu'>
        <button className='menu-mobile' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          { isMenuOpen ? '≡' : 'X' }
        </button>
      </div>
      <div className={`navbar-links ${isMenuOpen ? '' : 'open'}`}>
        <a href="#home" className="nav-link active">HOME</a>
       
      </div>
      
      <div className="navbar-logo-name">
        <img src="logo_fitsync.png" alt="logo_fitsync" className="logo-img" />
        <span className="logo-text">FITCLUB</span>
      </div>

      <div className={`navbar-right-nav ${isMenuOpen ? '' : 'open'}`}>
        <a href="/login" className="nav-link">Iniciar Sesión</a>
        <a href="/register">
        <button className="join-button">RESGISTRO</button>
        </a>
      </div>
    </nav>
  )
}
