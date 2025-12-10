import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaUserCircle, FaCog, FaUserMinus, FaHome, FaCalendarAlt, FaDollarSign, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import '../styles/NavbarLoged.css';

export default function NavbarLoged() {
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  /*const [avatarUrl, setAvatarUrl] = useState(null)*/
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Invitado');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('auth_user');
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

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleUpdateData = () => {
    alert('Funcionalidad para actualizar datos aún no implementada.');
    setIsDropdownOpen(false);
  };



  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
    } catch (e) {
      console.error('Logout error', e)
    } finally {
      // limpiar estado local y redirigir (cliente)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login' // o '/' según tu ruta
    }
  }

  return (
    <nav className={`navbar-container ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="navbar-logo-name">
        <img src="/logo_fitsync.png" alt="logo_fitsync" className="logo-img" />
        <NavLink to="/home" className="nav-link">
          <span className="logo-text">FITCLUB</span>
        </NavLink>
      </div>
      <div className='navbar-menu'>
        <button className='menu-mobile' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '≡' : 'X'}
        </button>
      </div>

      <div className="navbar-right menu-profile-container">
        <div className={`navbar-links ${isMenuOpen ? '' : 'open'}`}>
          <NavLink to="/home" className="nav-link">
            <FaHome />
            <span>Home</span>
          </NavLink>
          {/* <NavLink to="/classes" className="nav-link">
              <FaCalendarAlt />
              <span>Classes</span>
            </NavLink>
            <NavLink to="/pricing" className="nav-link">
              <FaDollarSign />
              <span>Pricing</span>
            </NavLink> */}
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
                <Link to="/settings">
                  <button className="dropdown-item">
                    <FaCog />
                    <span>Ajustes</span>
                  </button>
                </Link>
              </div>
              <div className="dropdown-section">
                <button className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Cerrar sesión</span>
                </button>
                <Link to="/eliminate-user">
                  <button className="dropdown-item danger">
                    <FaUserMinus />
                    <span>Eliminar cuenta</span>
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

