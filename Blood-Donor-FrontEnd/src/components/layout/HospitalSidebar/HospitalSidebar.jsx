import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../utils/constants';
import { formatRole, getUserInitials } from '../../../utils/authHelpers';
import '../UserSidebar/UserSidebar.css';

const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.HOSPITAL_HOME },
  { label: 'Patients', to: ROUTES.HOSPITAL_PATIENTS },
  { label: 'Send Blood Request', to: ROUTES.HOSPITAL_SEND_REQUEST },
  { label: 'Sent Requests', to: ROUTES.HOSPITAL_REQUESTS },
  { label: 'Profile', to: ROUTES.HOSPITAL_PROFILE },
];

function HospitalSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  const initials = getUserInitials(user?.name, user?.email);

  return (
    <aside className="user-sidebar" aria-label="Hospital navigation">
      <div className="user-sidebar__profile">
        <div className="user-sidebar__avatar">{initials}</div>
        <div className="user-sidebar__info">
          <p className="user-sidebar__name">{user?.name || 'Hospital'}</p>
          <p className="user-sidebar__email">{user?.email}</p>
          <span className="user-sidebar__role">{formatRole(user?.role)}</span>
        </div>
      </div>

      <nav className="user-sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `user-sidebar__link ${isActive ? 'user-sidebar__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}

        <button type="button" className="user-sidebar__logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default HospitalSidebar;
