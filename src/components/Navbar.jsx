import React from 'react'
import '../styles/Navbar.css'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(true);
  return (
    <nav className="navbar-container">
      <div className='navbar-menu'>
        <button className='menu-mobile' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          { isMenuOpen ? '≡' : 'X' }
        </button>
      </div>
      <div className="navbar-links">
        <a href="#home" className="nav-link active">HOME</a>
        <a href="#about" className="nav-link">ABOUT</a>
        <a href="#classes" className="nav-link">OUR CLASSES</a>
      </div>
      
      <div className="navbar-logo-name">
        <img src="logo_fitsync.png" alt="logo_fitsync" className="logo-img" />
        <span className="logo-text">FITCLUB</span>
      </div>

      <div className="navbar-right">
        <a href="/login" className="nav-link">Sign in</a>
        <a href="/register" className="nav-link">Sign up</a>
        <a href="/register">
        <button className="join-button">JOIN NOW</button>
        </a>
      </div>
    </nav>
  )
}   