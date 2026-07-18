import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../utils/constants';
import { formatRole, getUserInitials } from '../../../utils/authHelpers';
import '../UserSidebar/UserSidebar.css';

const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.BLOOD_BANK_HOME },
  { label: 'Inventory', to: ROUTES.BLOOD_BANK_INVENTORY },
  { label: 'Received Requests', to: ROUTES.BLOOD_BANK_RECEIVED_REQUESTS },
  { label: 'Send Request', to: ROUTES.BLOOD_BANK_SEND_REQUEST },
  { label: 'Stock Requests', to: ROUTES.BLOOD_BANK_HOSPITAL_REQUESTS },
  { label: 'Issue History', to: ROUTES.BLOOD_BANK_ISSUE_HISTORY },
  { label: 'Profile', to: ROUTES.BLOOD_BANK_PROFILE },
];

function BloodBankSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  const initials = getUserInitials(user?.name, user?.email);

  return (
    <aside className="user-sidebar" aria-label="Blood bank navigation">
      <div className="user-sidebar__profile">
        <div className="user-sidebar__avatar">{initials}</div>
        <div className="user-sidebar__info">
          <p className="user-sidebar__name">{user?.name || 'Blood Bank'}</p>
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

export default BloodBankSidebar;
