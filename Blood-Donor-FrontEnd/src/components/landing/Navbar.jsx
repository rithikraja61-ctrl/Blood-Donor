import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BloodDropLogo from '../icons/BloodDropLogo';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Contact', href: '#contact' },
];

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="#home" className="navbar__logo" onClick={handleNavClick}>
          <BloodDropLogo className="navbar__logo-icon" />
          <span className="navbar__logo-text">Blood Donor</span>
        </a>

        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="navbar__link"
              onClick={handleNavClick}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className={`navbar__actions ${menuOpen ? 'navbar__actions--open' : ''}`}>
          <button
            type="button"
            className="navbar__btn navbar__btn--outline"
            onClick={() => { navigate('/login'); handleNavClick(); }}
          >
            Login
          </button>
          <button
            type="button"
            className="navbar__btn navbar__btn--primary"
            onClick={() => { navigate('/register'); handleNavClick(); }}
          >
            Sign Up
          </button>
        </div>

        <button
          type="button"
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Navbar;