import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import CommonInput from '../../components/auth/CommonInput';
import {
  getBloodBankProfile,
  updateBloodBankProfile,
} from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import '../DonorProfile/DonorProfilePage.css';
import './BloodBankProfilePage.css';

function mapProfileToForm(data, fallbackName = '') {
  return {
    name: data?.bloodBankName || data?.name || fallbackName,
    email: data?.email || '',
    phoneNumber: data?.phoneNumber || '',
    address: data?.address || '',
    city: data?.city || '',
    state: data?.state || '',
    pincode: data?.pinCode || data?.pincode || '',
    licenseNumber: data?.licenseNumber || '',
    profileImageUrl: data?.profileImage || data?.profileImageUrl || '',
  };
}

function BloodBankProfilePage() {
  const { user, syncProfile } = useAuth();
  const [form, setForm] = useState(() => mapProfileToForm(null, user?.name || ''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBloodBankProfile()
      .then((data) => {
        setForm(mapProfileToForm(data, user?.name || ''));
      })
      .catch((err) => {
        if (user?.name) {
          setForm((prev) => ({ ...prev, name: prev.name || user.name }));
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load profile.');
      });
  }, [user?.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateBloodBankProfile({
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        licenseNumber: form.licenseNumber,
        profileImageUrl: form.profileImageUrl || undefined,
      });
      syncProfile({
        ...updated,
        name: updated.bloodBankName || updated.name,
        pincode: updated.pinCode || updated.pincode,
      });
      setForm(mapProfileToForm(updated, form.name));
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = form.name || user?.name || 'Blood bank';

  return (
    <div className="donor-profile-page">
      <PageHeader
        title="Blood bank profile"
        subtitle="Your registered blood bank details."
      />

      <section className="donor-profile-page__card blood-bank-profile__name-card" aria-label="Registered blood bank name">
        <p className="blood-bank-profile__name-label">Registered blood bank</p>
        <h2 className="blood-bank-profile__name-value">{displayName}</h2>
      </section>

      {error && <p className="donor-profile-page__error">{error}</p>}
      {success && <p style={{ color: 'var(--color-success, #0a7)' }}>{success}</p>}

      <form className="donor-profile-page__card" onSubmit={handleSubmit}>
        <CommonInput id="name" label="Blood bank name" name="name" value={form.name} onChange={handleChange} />
        <CommonInput id="email" label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <CommonInput id="phoneNumber" label="Phone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        <CommonInput id="address" label="Address" name="address" value={form.address} onChange={handleChange} />
        <CommonInput id="city" label="City" name="city" value={form.city} onChange={handleChange} />
        <CommonInput id="state" label="State" name="state" value={form.state} onChange={handleChange} />
        <CommonInput id="pincode" label="PIN code" name="pincode" value={form.pincode} onChange={handleChange} />
        <CommonInput id="licenseNumber" label="License number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
        <CommonInput id="profileImageUrl" label="Profile image URL" name="profileImageUrl" value={form.profileImageUrl} onChange={handleChange} />
        <button type="submit" className="auth-form__submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

export default BloodBankProfilePage;
