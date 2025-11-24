import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaUserCircle, FaCog, FaUserMinus, FaHome, FaCalendarAlt, FaDollarSign, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import '../styles/NavbarLoged.css';

export default function NavbarLoged() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Invitado');
  const [userEmail, setUserEmail] = useState('user@example.com');

  useEffect(() => {
    const raw = localStorage.getItem('auth_user') || localStorage.getItem('user');
    if (raw) {
      try {
        const u = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const name = u.nombre || u.name || u.first_name || u.username || (u.email ? u.email.split('@')[0] : null);
        setUserName(name || 'Usuario');
        setUserEmail(u.email || 'user@example.com');
      } catch {
        const u = String(raw);
        setUserName(u);
        setUserEmail('user@example.com');
      }
    }
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleUpdateData = () => {
    alert('Funcionalidad para actualizar datos aún no implementada.');
    setIsDropdownOpen(false);
  };

  const handleDeleteAccount = () => {
    alert('Funcionalidad para eliminar cuenta aún no implementada.');
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    // Aquí iría la lógica para cerrar sesión
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirigir a la página de login
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-logo-name">
        <img src="/logo_fitsync.png" alt="logo_fitsync" className="logo-img" />
        <span className="logo-text">FITCLUB</span>
      </div>

      <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        <NavLink to="/home" className="nav-link">
          <FaHome />
          <span>Home</span>
        </NavLink>
        <NavLink to="/classes" className="nav-link">
          <FaCalendarAlt />
          <span>Classes</span>
        </NavLink>
        <NavLink to="/pricing" className="nav-link">
          <FaDollarSign />
          <span>Pricing</span>
        </NavLink>
      </div>

      <div className="navbar-right">
        <div className="user-box" title={userName} onClick={toggleDropdown}>
          <FaUserCircle className="user-avatar-icon" />
          <span className="user-name">{userName}</span>
          <FaChevronDown className={`dropdown-caret ${isDropdownOpen ? 'open' : ''}`} />
        </div>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="user-info">
              <FaUserCircle className="user-avatar-icon-large" />
              <p className="user-info-name">{userName}</p>
              <p className="user-info-email">{userEmail}</p>
            </div>
            <div className="dropdown-section">
              <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <FaUserCircle />
                <span>Mi Perfil</span>
              </Link>
              <button className="dropdown-item" onClick={handleUpdateData}>
                <FaCog />
                <span>Ajustes</span>
              </button>
            </div>
            <div className="dropdown-section">
              <button className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Cerrar sesión</span>
              </button>
              <button className="dropdown-item danger" onClick={handleDeleteAccount}>
                <FaUserMinus />
                <span>Eliminar cuenta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
   