import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DonorProfileForm from '../../components/profile/DonorProfileForm';
import { getDonorProfile, updateDonorProfile } from '../../services/donorProfileService';
import { TYPE_TO_BLOOD_GROUP, ROUTES } from '../../utils/constants';
import { ApiError } from '../../services/apiClient';
import '../../components/profile/ProfileForm.css';
import './DonorProfilePage.css';

function DonorProfilePage() {
  const { user, logout, syncProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getDonorProfile();
      setProfile(data);
      syncProfile(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [syncProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (payload) => {
    const updated = await updateDonorProfile(payload);
    setProfile(updated);
    syncProfile(updated);
    setEditing(false);
    return updated;
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  const bloodGroup = profile?.bloodType
    ? TYPE_TO_BLOOD_GROUP[profile.bloodType] || profile.bloodType
    : user?.bloodGroup;

  return (
    <div className="donor-profile-page">
      <header className="donor-profile-page__header">
        <h2>My Donor Profile</h2>
        <p>View and update your account details and availability.</p>
      </header>

      {error && <p className="donor-profile-page__error">{error}</p>}

      {loading ? (
        <p className="donor-profile-page__loading">Loading profile…</p>
      ) : editing ? (
        <DonorProfileForm
          profile={profile}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <button
            type="button"
            className="donor-profile-page__edit-btn"
            onClick={() => setEditing(true)}
          >
            Edit profile
          </button>

          <div className="donor-profile-page__card">
            <p><strong>Name:</strong> {profile?.name || user?.name || '—'}</p>
            <p><strong>Email:</strong> {profile?.email || user?.email || '—'}</p>
            <p><strong>Phone:</strong> {profile?.phoneNumber || '—'}</p>
            <p><strong>Blood group:</strong> {bloodGroup || '—'}</p>
            <p><strong>City:</strong> {profile?.city || '—'}</p>
            <p><strong>Pincode:</strong> {profile?.pincode || '—'}</p>
            <p><strong>Address:</strong> {profile?.address || '—'}</p>
            <p><strong>Available:</strong> {profile?.available ? 'Yes' : 'No'}</p>
            <p><strong>Last donation:</strong> {profile?.lastDonationDate || 'Never'}</p>
          </div>
        </>
      )}

      <button type="button" className="donor-profile-page__logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default DonorProfilePage;
