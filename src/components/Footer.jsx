import React from 'react'
import '../styles/Footer.css'

export default function Footer() {
    
  return (
    <footer className='site-footer'>
        <div className="footer-content">

        <div className="footer-column brand-column">
            <div className="brand-info">
                <span className="logo-icon"><img src="logo_fitsync.png" alt="FitSync" /></span>
                <span className="logo-text">FitSync</span>
            </div>
            <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Autores Invitados</a></li>
            </ul>
        </div>

        <div className="footer-column digital-column">
            <div className="column-title">Digital</div>
            <ul>
                <li><a href="#">Servicios</a></li>
                <li><a href="#">Contacto: +58 41400000</a></li>
            </ul>
        </div>

        <div className="footer-column info-column">
            <div className="column-title">INFORMACIÓN</div>
            <ul>
                <li><a href="#">Plan de Social Media</a></li>
                <li><a href="#">Plan de Marketing Digital</a></li>
                <li><a href="#">Marketing de Contenidos</a></li>
            </ul>
        </div>

        <div className="footer-column community-column">
            <div className="column-title">MI COMUNIDAD</div>
            <div className="social-icons">
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                <a href="#" aria-label="Pinterest"><i className="fab fa-pinterest-p"></i></a>
                <a href="#" aria-label="RSS"><i className="fas fa-rss"></i></a>
            </div>
        </div>
    </div>

    <div className="footer-bottom">
        <p className="copyright">Copyright © 2025 - <a href="#">FitSync</a> | <a href="#">Aviso Legal y Política de Privacidad</a></p>
        <p className="web-dev">Desarrollo Web FitSync Team</p>
    </div>
    </footer>
  )
}   