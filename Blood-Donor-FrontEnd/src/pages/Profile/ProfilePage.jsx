import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileCard from '../../components/profile/ProfileCard/ProfileCard';
import UserProfileForm from '../../components/profile/UserProfileForm';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { TYPE_TO_BLOOD_GROUP, ROUTES } from '../../utils/constants';
import { ApiError } from '../../services/apiClient';
import '../../components/profile/ProfileForm.css';
import './ProfilePage.css';

function mapProfileForDisplay(profile, authUser) {
  if (!profile) return authUser;

  return {
    ...authUser,
    name: profile.name,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    address: profile.address,
    pincode: profile.pincode,
    bloodGroup: profile.bloodType
      ? TYPE_TO_BLOOD_GROUP[profile.bloodType] || profile.bloodType
      : authUser?.bloodGroup,
  };
}

function ProfilePage() {
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
      const data = await getUserProfile();
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
    const updated = await updateUserProfile(payload);
    setProfile(updated);
    syncProfile(updated);
    setEditing(false);
    return updated;
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  const displayUser = mapProfileForDisplay(profile, user);

  return (
    <div className="profile-page">
      <header className="profile-page__header">
        <h2 className="profile-page__title">My Profile</h2>
        <p className="profile-page__subtitle">View and manage your account details.</p>
      </header>

      {error && <p className="profile-page__error">{error}</p>}

      {loading ? (
        <p className="profile-page__loading">Loading profile…</p>
      ) : editing ? (
        <UserProfileForm
          profile={profile}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <button
            type="button"
            className="profile-page__edit-btn"
            onClick={() => setEditing(true)}
          >
            Edit profile
          </button>
          <ProfileCard user={displayUser} />
        </>
      )}

      <button type="button" className="profile-page__logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default ProfilePage;
