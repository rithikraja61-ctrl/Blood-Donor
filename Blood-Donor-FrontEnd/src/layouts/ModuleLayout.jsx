import { Link } from 'react-router-dom';
import './ModuleLayout.css';

function ModuleLayout({ children }) {
  return (
    <div className="module-layout">
      <header className="module-layout__header">
        <Link to="/" className="module-layout__brand">
          🩸 Blood Donor
        </Link>
        <nav className="module-layout__nav">
          <Link to="/" className="module-layout__link">Home</Link>
          <Link to="/login" className="module-layout__link">Login</Link>
        </nav>
      </header>
      <main className="module-layout__content">{children}</main>
    </div>
  );
}

export default ModuleLayout;
