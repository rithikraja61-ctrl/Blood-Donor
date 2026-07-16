import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import './UserHomePage.css';

function UserHomePage() {
  const { user } = useAuth();

  return (
    <div className="user-home">
      <h1 className="user-home__title">
        Welcome{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="user-home__subtitle">Choose what you want to do today.</p>

      <div className="user-home__cards">
        <Link to={ROUTES.PROFILE} className="user-home__card">
          <span className="user-home__card-icon" aria-hidden="true">👤</span>
          <span className="user-home__card-label">View Profile</span>
        </Link>
        <Link to={ROUTES.FIND_DONOR} className="user-home__card user-home__card--primary">
          <span className="user-home__card-icon" aria-hidden="true">🩸</span>
          <span className="user-home__card-label">Find Donor</span>
        </Link>
      </div>
    </div>
  );
}

export default UserHomePage;
