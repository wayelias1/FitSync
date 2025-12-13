import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si hace scroll hacia abajo, ocultar navbar
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      // Si hace scroll hacia arriba, mostrar navbar
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav className={`navbar-container ${isVisible ? 'visible' : 'hidden'}`}>
      <div className='navbar-menu'>
        <button className='menu-mobile' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '≡' : 'X'}
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
