import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/apiClient';
import { mapBackendFieldErrors } from '../../services/authService';
import { getPostLoginRoute } from '../../utils/roleRoutes';
import RoleSelector from './RoleSelector';
import CommonInput from './CommonInput';
import PasswordInput from './PasswordInput';
import LocationSelector from '../map/LocationSelector';
import { locationFromFormFields, applyLocationToFormFields } from '../../utils/locationUtils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,15}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

const PHONE_FIELDS = new Set(['phone', 'hospitalPhone', 'bloodBankPhone']);

const BLOOD_GROUPS = [
  { value: '', label: 'Select Blood Group' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  bloodGroup: '',
  pincode: '',
  hospitalName: '',
  hospitalEmail: '',
  hospitalPhone: '',
  hospitalAddress: '',
  hospitalCity: '',
  hospitalState: '',
  hospitalLicenseNumber: '',
  bloodBankName: '',
  bloodBankEmail: '',
  bloodBankPhone: '',
  bloodBankAddress: '',
  bloodBankCity: '',
  bloodBankState: '',
  bloodBankLicenseNumber: '',
  licenseNumber: '',
  password: '',
  confirmPassword: '',
  latitude: null,
  longitude: null,
};

function SignupForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [activeRole, setActiveRole] = useState('User');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;

    if (PHONE_FIELDS.has(name)) {
      filtered = value.replace(/\D/g, '');
    } else if (name === 'pincode') {
      filtered = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [name]: filtered }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrors({});
    setSubmitError('');
    setFormData((prev) => ({ ...prev, latitude: null, longitude: null }));
  };

  const handleLocationChange = (loc) => {
    setFormData((prev) => applyLocationToFormFields(prev, loc, activeRole));
    setErrors((prev) => {
      const next = { ...prev };
      if (loc.latitude != null && loc.longitude != null) delete next.location;
      if (loc.pincode) delete next.pincode;
      if (loc.address || loc.formattedAddress) {
        if (activeRole === 'Hospital') delete next.hospitalAddress;
        else if (activeRole === 'Blood Bank') delete next.bloodBankAddress;
        else delete next.address;
      }
      if (loc.city && activeRole === 'Donor') delete next.city;
      if (loc.city && activeRole === 'Hospital') delete next.hospitalCity;
      if (loc.city && activeRole === 'Blood Bank') delete next.bloodBankCity;
      if (loc.state && activeRole === 'Hospital') delete next.hospitalState;
      if (loc.state && activeRole === 'Blood Bank') delete next.bloodBankState;
      return next;
    });
    setSubmitError('');
  };

  const getSignupLocation = () => {
    if (activeRole === 'Hospital') {
      return locationFromFormFields({
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.hospitalAddress,
        city: formData.hospitalCity,
        state: formData.hospitalState,
        pincode: formData.pincode,
      });
    }
    if (activeRole === 'Blood Bank') {
      return locationFromFormFields({
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.bloodBankAddress,
        city: formData.bloodBankCity,
        state: formData.bloodBankState,
        pincode: formData.pincode,
      });
    }
    return locationFromFormFields({
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
    });
  };

  const validatePasswordFields = (d, e) => {
    if (!d.password) e.password = 'Password is required';
    else if (d.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!d.confirmPassword) e.confirmPassword = 'Confirm password is required';
    else if (d.password !== d.confirmPassword) e.confirmPassword = 'Passwords do not match';
  };

  const validatePincode = (d, e) => {
    if (!d.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!PINCODE_REGEX.test(d.pincode)) e.pincode = 'Pincode must be a 6-digit number';
  };

  const validate = () => {
    const e = {};
    const d = formData;

    if (activeRole === 'User' || activeRole === 'Donor') {
      if (!d.name.trim()) e.name = 'Full name is required';
      if (!d.email.trim()) e.email = 'Email is required';
      else if (!EMAIL_REGEX.test(d.email)) e.email = 'Invalid email format';
      if (!d.phone.trim()) e.phone = 'Phone number is required';
      else if (!PHONE_REGEX.test(d.phone)) e.phone = 'Phone must contain 10–15 digits only';
      if (!d.address.trim()) e.address = 'Address is required';
      if (activeRole === 'Donor' && !d.city.trim()) e.city = 'City is required';
      if (!d.bloodGroup) e.bloodGroup = 'Blood group is required';
    }

    if (activeRole === 'Hospital') {
      if (!d.hospitalName.trim()) e.hospitalName = 'Hospital name is required';
      if (!d.hospitalEmail.trim()) e.hospitalEmail = 'Hospital email is required';
      else if (!EMAIL_REGEX.test(d.hospitalEmail)) e.hospitalEmail = 'Invalid email format';
      if (!d.hospitalPhone.trim()) e.hospitalPhone = 'Hospital phone number is required';
      else if (!PHONE_REGEX.test(d.hospitalPhone)) e.hospitalPhone = 'Phone must contain 10–15 digits only';
      if (!d.hospitalAddress.trim()) e.hospitalAddress = 'Hospital address is required';
      if (!d.hospitalCity.trim()) e.hospitalCity = 'City is required';
      if (!d.hospitalState.trim()) e.hospitalState = 'State is required';
      if (!d.hospitalLicenseNumber.trim()) e.hospitalLicenseNumber = 'License number is required';
    }

    if (activeRole === 'Blood Bank') {
      if (!d.bloodBankName.trim()) e.bloodBankName = 'Blood bank name is required';
      if (!d.bloodBankEmail.trim()) e.bloodBankEmail = 'Blood bank email is required';
      else if (!EMAIL_REGEX.test(d.bloodBankEmail)) e.bloodBankEmail = 'Invalid email format';
      if (!d.bloodBankPhone.trim()) e.bloodBankPhone = 'Blood bank phone number is required';
      else if (!PHONE_REGEX.test(d.bloodBankPhone)) e.bloodBankPhone = 'Phone must contain 10–15 digits only';
      if (!d.bloodBankAddress.trim()) e.bloodBankAddress = 'Blood bank address is required';
      if (!d.bloodBankCity.trim()) e.bloodBankCity = 'City is required';
      if (!d.bloodBankState.trim()) e.bloodBankState = 'State is required';
      if (!d.bloodBankLicenseNumber.trim()) e.bloodBankLicenseNumber = 'License number is required';
    }

    validatePincode(d, e);
    validatePasswordFields(d, e);

    if (d.latitude == null || d.longitude == null) {
      e.location = 'Please select your location on the map';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const authUser = await register(activeRole, formData);
      navigate(getPostLoginRoute(authUser.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(mapBackendFieldErrors(err.fieldErrors, activeRole));
        setSubmitError(err.message);
      } else {
        setSubmitError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isPersonalRole = activeRole === 'User' || activeRole === 'Donor';

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <RoleSelector activeRole={activeRole} onRoleChange={handleRoleChange} />

      <div key={activeRole} className="role-fields">
        {isPersonalRole && (
          <>
            <CommonInput
              id="name"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter your full name"
            />
            <CommonInput
              id="email"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
            />
            <CommonInput
              id="phone"
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Enter phone number"
            />
            <LocationSelector
              location={getSignupLocation()}
              onLocationChange={handleLocationChange}
              error={errors.location}
              title="Your location"
            />
            <CommonInput
              id="address"
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Auto-filled from location or enter manually"
            />
            {activeRole === 'Donor' && (
              <CommonInput
                id="city"
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="Auto-filled from location or enter manually"
              />
            )}
            <CommonInput
              id="pincode"
              label="Pincode"
              name="pincode"
              type="tel"
              value={formData.pincode}
              onChange={handleChange}
              error={errors.pincode}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="bloodGroup"
              label="Blood Group"
              name="bloodGroup"
              type="select"
              value={formData.bloodGroup}
              onChange={handleChange}
              error={errors.bloodGroup}
              options={BLOOD_GROUPS}
            />
          </>
        )}

        {activeRole === 'Hospital' && (
          <>
            <CommonInput
              id="hospitalName"
              label="Hospital Name"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              error={errors.hospitalName}
              placeholder="Enter hospital name"
            />
            <CommonInput
              id="hospitalEmail"
              label="Hospital Email"
              name="hospitalEmail"
              type="email"
              value={formData.hospitalEmail}
              onChange={handleChange}
              error={errors.hospitalEmail}
              placeholder="Enter hospital email"
            />
            <CommonInput
              id="hospitalPhone"
              label="Hospital Phone Number"
              name="hospitalPhone"
              type="tel"
              value={formData.hospitalPhone}
              onChange={handleChange}
              error={errors.hospitalPhone}
              placeholder="Enter hospital phone number"
            />
            <LocationSelector
              location={getSignupLocation()}
              onLocationChange={handleLocationChange}
              error={errors.location}
              title="Hospital location"
            />
            <CommonInput
              id="hospitalAddress"
              label="Hospital Address"
              name="hospitalAddress"
              value={formData.hospitalAddress}
              onChange={handleChange}
              error={errors.hospitalAddress}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="hospitalCity"
              label="City"
              name="hospitalCity"
              value={formData.hospitalCity}
              onChange={handleChange}
              error={errors.hospitalCity}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="hospitalState"
              label="State"
              name="hospitalState"
              value={formData.hospitalState}
              onChange={handleChange}
              error={errors.hospitalState}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="pincode"
              label="Pincode"
              name="pincode"
              type="tel"
              value={formData.pincode}
              onChange={handleChange}
              error={errors.pincode}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="hospitalLicenseNumber"
              label="License Number"
              name="hospitalLicenseNumber"
              value={formData.hospitalLicenseNumber}
              onChange={handleChange}
              error={errors.hospitalLicenseNumber}
              placeholder="Enter license number"
            />
          </>
        )}

        {activeRole === 'Blood Bank' && (
          <>
            <CommonInput
              id="bloodBankName"
              label="Blood Bank Name"
              name="bloodBankName"
              value={formData.bloodBankName}
              onChange={handleChange}
              error={errors.bloodBankName}
              placeholder="Enter blood bank name"
            />
            <CommonInput
              id="bloodBankEmail"
              label="Blood Bank Email"
              name="bloodBankEmail"
              type="email"
              value={formData.bloodBankEmail}
              onChange={handleChange}
              error={errors.bloodBankEmail}
              placeholder="Enter blood bank email"
            />
            <CommonInput
              id="bloodBankPhone"
              label="Blood Bank Phone Number"
              name="bloodBankPhone"
              type="tel"
              value={formData.bloodBankPhone}
              onChange={handleChange}
              error={errors.bloodBankPhone}
              placeholder="Enter blood bank phone number"
            />
            <LocationSelector
              location={getSignupLocation()}
              onLocationChange={handleLocationChange}
              error={errors.location}
              title="Blood bank location"
            />
            <CommonInput
              id="bloodBankAddress"
              label="Blood Bank Address"
              name="bloodBankAddress"
              value={formData.bloodBankAddress}
              onChange={handleChange}
              error={errors.bloodBankAddress}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="bloodBankCity"
              label="City"
              name="bloodBankCity"
              value={formData.bloodBankCity}
              onChange={handleChange}
              error={errors.bloodBankCity}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="bloodBankState"
              label="State"
              name="bloodBankState"
              value={formData.bloodBankState}
              onChange={handleChange}
              error={errors.bloodBankState}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="pincode"
              label="Pincode"
              name="pincode"
              type="tel"
              value={formData.pincode}
              onChange={handleChange}
              error={errors.pincode}
              placeholder="Auto-filled from location or enter manually"
            />
            <CommonInput
              id="bloodBankLicenseNumber"
              label="License Number"
              name="bloodBankLicenseNumber"
              value={formData.bloodBankLicenseNumber}
              onChange={handleChange}
              error={errors.bloodBankLicenseNumber}
              placeholder="Enter license number"
            />
          </>
        )}
      </div>

      <PasswordInput
        id="password"
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Re-enter password"
        autoComplete="new-password"
      />

      {submitError && (
        <div className="login-form__login-error">{submitError}</div>
      )}

      <button type="submit" className="auth-form__submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>

      <p className="register-page__login-link">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('/login')}>
          Login
        </button>
      </p>
    </form>
  );
}

export default SignupForm;
