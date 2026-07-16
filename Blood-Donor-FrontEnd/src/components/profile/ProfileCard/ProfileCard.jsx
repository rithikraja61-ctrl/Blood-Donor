import { formatRole, getUserInitials } from '../../../utils/authHelpers';
import './ProfileCard.css';

function ProfileField({ label, value }) {
  return (
    <div className="profile-field">
      <span className="profile-field__label">{label}</span>
      <span className="profile-field__value">{value || '—'}</span>
    </div>
  );
}

function ProfileCard({ user }) {
  const initials = getUserInitials(user?.name, user?.email);

  return (
    <section className="profile-card">
      <div className="profile-card__header">
        <div className="profile-card__avatar">{initials}</div>
        <div>
          <h1 className="profile-card__name">{user?.name || 'User'}</h1>
          <p className="profile-card__email">{user?.email}</p>
        </div>
      </div>

      <div className="profile-card__grid">
        <ProfileField label="Full Name" value={user?.name} />
        <ProfileField label="Email" value={user?.email} />
        <ProfileField label="Phone Number" value={user?.phoneNumber} />
        <ProfileField label="Blood Group" value={user?.bloodGroup} />
        <ProfileField label="Address" value={user?.address} />
        <ProfileField label="Pincode" value={user?.pincode} />
        <ProfileField label="Role" value={formatRole(user?.role)} />
      </div>
    </section>
  );
}

export default ProfileCard;
