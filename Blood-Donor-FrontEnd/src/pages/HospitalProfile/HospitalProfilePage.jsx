import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import CommonInput from '../../components/auth/CommonInput';
import {
  getHospitalProfile,
  updateHospitalProfile,
} from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import LocationPickerMap from '../../components/map/LocationPickerMap';
import '../DonorProfile/DonorProfilePage.css';

const EMPTY = {
  name: '',
  phoneNumber: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  licenseNumber: '',
  latitude: null,
  longitude: null,
};

function HospitalProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    getHospitalProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          licenseNumber: data.licenseNumber || '',
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        });
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load profile.');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.latitude == null || form.longitude == null) {
      setLocationError('Please select your hospital location on the map.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    setLocationError('');
    try {
      const updated = await updateHospitalProfile(form);
      setProfile(updated);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="donor-profile-page">
      <PageHeader
        title="Hospital profile"
        subtitle="View and update your hospital details."
      />

      {error && <p className="donor-profile-page__error">{error}</p>}
      {success && <p style={{ color: 'var(--color-success, #0a7)' }}>{success}</p>}

      {profile && (
        <p className="donor-profile-page__card">
          <strong>Email:</strong> {profile.email}
        </p>
      )}

      <form className="donor-profile-page__card" onSubmit={handleSubmit}>
        <CommonInput id="name" label="Hospital name" name="name" value={form.name} onChange={handleChange} />
        <CommonInput id="phoneNumber" label="Phone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        <CommonInput id="address" label="Address" name="address" value={form.address} onChange={handleChange} />
        <CommonInput id="city" label="City" name="city" value={form.city} onChange={handleChange} />
        <CommonInput id="state" label="State" name="state" value={form.state} onChange={handleChange} />
        <CommonInput id="pincode" label="PIN code" name="pincode" value={form.pincode} onChange={handleChange} />
        <LocationPickerMap
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={({ latitude, longitude }) => {
            setForm((prev) => ({ ...prev, latitude, longitude }));
            setLocationError('');
          }}
          error={locationError}
        />
        <CommonInput id="licenseNumber" label="License number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
        <button type="submit" className="auth-form__submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

export default HospitalProfilePage;
