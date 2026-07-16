import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileCard from '../../components/profile/ProfileCard/ProfileCard';
import { ROUTES } from '../../utils/constants';
import './ProfilePage.css';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <div className="profile-page">
      <header className="profile-page__header">
        <h2 className="profile-page__title">My Profile</h2>
        <p className="profile-page__subtitle">View and manage your account details.</p>
      </header>

      <ProfileCard user={user} />

      <button type="button" className="profile-page__logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default ProfilePage;
