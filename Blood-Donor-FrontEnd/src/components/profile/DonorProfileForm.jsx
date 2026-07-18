import { useEffect, useState } from 'react';
import {
  BLOOD_GROUPS,
  BLOOD_GROUP_TO_TYPE,
  TYPE_TO_BLOOD_GROUP,
} from '../../utils/constants';
import { ApiError } from '../../services/apiClient';
import LocationPickerMap from '../map/LocationPickerMap';
import './ProfileForm.css';

const PHONE_REGEX = /^[0-9]{10,15}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

function DonorProfileForm({ profile, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    city: '',
    pincode: '',
    bloodGroup: '',
    available: true,
    password: '',
    latitude: null,
    longitude: null,
  });
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        pincode: profile.pincode || '',
        bloodGroup: profile.bloodType
          ? TYPE_TO_BLOOD_GROUP[profile.bloodType] || profile.bloodType
          : '',
        available: profile.available ?? true,
        password: '',
        latitude: profile.latitude ?? null,
        longitude: profile.longitude ?? null,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let next = type === 'checkbox' ? checked : value;

    if (name === 'phoneNumber') {
      next = value.replace(/\D/g, '').slice(0, 15);
    } else if (name === 'pincode') {
      next = value.replace(/\D/g, '').slice(0, 6);
    }

    setForm((prev) => ({ ...prev, [name]: next }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!PHONE_REGEX.test(form.phoneNumber)) {
      setError('Phone must be 10–15 digits.');
      return;
    }

    if (!form.address.trim()) {
      setError('Address is required.');
      return;
    }

    if (!form.city.trim()) {
      setError('City is required.');
      return;
    }

    if (!PINCODE_REGEX.test(form.pincode)) {
      setError('Pincode must be 6 digits.');
      return;
    }

    if (!form.bloodGroup) {
      setError('Blood group is required.');
      return;
    }

    if (form.password && form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (form.latitude == null || form.longitude == null) {
      setLocationError('Please select your location on the map.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      phoneNumber: form.phoneNumber,
      address: form.address.trim(),
      city: form.city.trim(),
      pincode: form.pincode,
      bloodType: BLOOD_GROUP_TO_TYPE[form.bloodGroup],
      available: form.available,
      latitude: form.latitude,
      longitude: form.longitude,
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    setLoading(true);

    try {
      const updated = await onSave(payload);
      setSuccess('Profile updated successfully.');
      setForm((prev) => ({ ...prev, password: '' }));
      return updated;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update profile.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <label className="profile-form__field">
        Full name
        <input type="text" name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label className="profile-form__field">
        Phone number
        <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
      </label>

      <label className="profile-form__field">
        Address
        <textarea name="address" value={form.address} onChange={handleChange} rows={2} required />
      </label>

      <label className="profile-form__field">
        City
        <input type="text" name="city" value={form.city} onChange={handleChange} required />
      </label>

      <label className="profile-form__field">
        Pincode
        <input type="text" name="pincode" value={form.pincode} onChange={handleChange} required />
      </label>

      <LocationPickerMap
        latitude={form.latitude}
        longitude={form.longitude}
        onChange={({ latitude, longitude }) => {
          setForm((prev) => ({ ...prev, latitude, longitude }));
          setLocationError('');
        }}
        error={locationError}
      />

      <label className="profile-form__field">
        Blood group
        <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
          <option value="">Select blood group</option>
          {BLOOD_GROUPS.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </label>

      <label className="profile-form__field profile-form__field--checkbox">
        <input
          type="checkbox"
          name="available"
          checked={form.available}
          onChange={handleChange}
        />
        Available to donate
      </label>

      <label className="profile-form__field">
        New password (optional)
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Leave blank to keep current password"
          autoComplete="new-password"
        />
      </label>

      {error && <p className="profile-form__error">{error}</p>}
      {success && <p className="profile-form__success">{success}</p>}

      <div className="profile-form__actions">
        <button type="submit" className="profile-form__save" disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" className="profile-form__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DonorProfileForm;
