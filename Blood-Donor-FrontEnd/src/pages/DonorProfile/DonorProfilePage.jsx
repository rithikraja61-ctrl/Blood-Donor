import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDonorProfile } from '../../services/donorProfileService';
import { TYPE_TO_BLOOD_GROUP, ROUTES } from '../../utils/constants';
import { ApiError } from '../../services/apiClient';
import './DonorProfilePage.css';

function DonorProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDonorProfile()
      .then(setProfile)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load profile.');
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  const display = profile || user;
  const bloodGroup = profile?.bloodType
    ? TYPE_TO_BLOOD_GROUP[profile.bloodType] || profile.bloodType
    : user?.bloodGroup;

  return (
    <div className="donor-profile-page">
      <header className="donor-profile-page__header">
        <h2>My Donor Profile</h2>
        <p>Your account details and availability.</p>
      </header>

      {error && <p className="donor-profile-page__error">{error}</p>}

      <div className="donor-profile-page__card">
        <p><strong>Name:</strong> {display?.name || '—'}</p>
        <p><strong>Email:</strong> {display?.email || user?.email || '—'}</p>
        <p><strong>Phone:</strong> {display?.phoneNumber || '—'}</p>
        <p><strong>Blood group:</strong> {bloodGroup || '—'}</p>
        <p><strong>City:</strong> {display?.city || '—'}</p>
        <p><strong>Pincode:</strong> {display?.pincode || '—'}</p>
        <p><strong>Address:</strong> {display?.address || '—'}</p>
        {profile && (
          <p><strong>Available:</strong> {profile.available ? 'Yes' : 'No'}</p>
        )}
      </div>

      <button type="button" className="donor-profile-page__logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default DonorProfilePage;
