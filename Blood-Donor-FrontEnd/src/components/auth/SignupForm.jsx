import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/apiClient';
import { mapBackendFieldErrors } from '../../services/authService';
import RoleSelector from './RoleSelector';
import CommonInput from './CommonInput';
import PasswordInput from './PasswordInput';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,15}$/;

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
  pincode: '',
  city: '',
  password: '',
  confirmPassword: '',
  bloodGroup: '',
  hospitalName: '',
  hospitalEmail: '',
  hospitalPhone: '',
  hospitalAddress: '',
  licenseNumber: '',
  organizationName: '',
  organizationEmail: '',
  organizationPhone: '',
  organizationAddress: '',
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
    const filtered =
      name === 'phone' || name === 'hospitalPhone' || name === 'organizationPhone' || name === 'pincode'
        ? value.replace(/\D/g, '')
        : value;

    setFormData((prev) => ({ ...prev, [name]: filtered }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrors({});
    setSubmitError('');
  };

  const validate = () => {
    const e = {};
    const d = formData;

    if (!d.name.trim()) e.name = 'Full name is required';
    if (!d.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_REGEX.test(d.email)) e.email = 'Invalid email format';
    if (!d.phone.trim()) e.phone = 'Phone number is required';
    else if (!PHONE_REGEX.test(d.phone)) e.phone = 'Phone must contain 10–15 digits only';
    if (!d.address.trim()) e.address = 'Address is required';
    if (!d.password) e.password = 'Password is required';
    else if (d.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!d.confirmPassword) e.confirmPassword = 'Confirm password is required';
    else if (d.password !== d.confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (activeRole === 'User' || activeRole === 'Donor') {
      if (!d.bloodGroup) e.bloodGroup = 'Blood group is required';
      if (!d.pincode.trim()) e.pincode = 'PIN code is required';
      else if (!/^[0-9]{6}$/.test(d.pincode)) e.pincode = 'PIN code must be 6 digits';
    }

    if (activeRole === 'Donor') {
      if (!d.city.trim()) e.city = 'City is required';
    }

    if (activeRole === 'Hospital') {
      if (!d.hospitalName.trim()) e.hospitalName = 'Hospital name is required';
      if (!d.hospitalEmail.trim()) e.hospitalEmail = 'Hospital email is required';
      else if (!EMAIL_REGEX.test(d.hospitalEmail)) e.hospitalEmail = 'Invalid email format';
      if (!d.hospitalPhone.trim()) e.hospitalPhone = 'Hospital phone is required';
      else if (!PHONE_REGEX.test(d.hospitalPhone)) e.hospitalPhone = 'Phone must contain 10–15 digits only';
      if (!d.hospitalAddress.trim()) e.hospitalAddress = 'Hospital address is required';
      if (!d.licenseNumber.trim()) e.licenseNumber = 'License number is required';
    }

    if (activeRole === 'Blood Bank') {
      if (!d.organizationName.trim()) e.organizationName = 'Organization name is required';
      if (!d.organizationEmail.trim()) e.organizationEmail = 'Organization email is required';
      else if (!EMAIL_REGEX.test(d.organizationEmail)) e.organizationEmail = 'Invalid email format';
      if (!d.organizationPhone.trim()) e.organizationPhone = 'Organization phone is required';
      else if (!PHONE_REGEX.test(d.organizationPhone)) e.organizationPhone = 'Phone must contain 10–15 digits only';
      if (!d.organizationAddress.trim()) e.organizationAddress = 'Organization address is required';
      if (!d.licenseNumber.trim()) e.licenseNumber = 'License number is required';
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
      await register(activeRole, formData);
      navigate('/');
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

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <RoleSelector activeRole={activeRole} onRoleChange={handleRoleChange} />

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

      <CommonInput
        id="address"
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder="Enter your address"
      />

      {(activeRole === 'User' || activeRole === 'Donor') && (
        <CommonInput
          id="pincode"
          label="PIN Code"
          name="pincode"
          type="tel"
          value={formData.pincode}
          onChange={handleChange}
          error={errors.pincode}
          placeholder="Enter 6-digit PIN code"
        />
      )}

      <div key={activeRole} className="role-fields">
        {(activeRole === 'User' || activeRole === 'Donor') && (
          <>
            {activeRole === 'Donor' && (
              <CommonInput
                id="city"
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="Enter your city"
              />
            )}
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
              label="Hospital Phone"
              name="hospitalPhone"
              type="tel"
              value={formData.hospitalPhone}
              onChange={handleChange}
              error={errors.hospitalPhone}
              placeholder="Enter hospital phone"
            />
            <CommonInput
              id="hospitalAddress"
              label="Hospital Address"
              name="hospitalAddress"
              value={formData.hospitalAddress}
              onChange={handleChange}
              error={errors.hospitalAddress}
              placeholder="Enter hospital address"
            />
            <CommonInput
              id="licenseNumber"
              label="License Number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              error={errors.licenseNumber}
              placeholder="Enter license number"
            />
          </>
        )}

        {activeRole === 'Blood Bank' && (
          <>
            <CommonInput
              id="organizationName"
              label="Organization Name"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              error={errors.organizationName}
              placeholder="Enter organization name"
            />
            <CommonInput
              id="organizationEmail"
              label="Organization Email"
              name="organizationEmail"
              type="email"
              value={formData.organizationEmail}
              onChange={handleChange}
              error={errors.organizationEmail}
              placeholder="Enter organization email"
            />
            <CommonInput
              id="organizationPhone"
              label="Organization Phone"
              name="organizationPhone"
              type="tel"
              value={formData.organizationPhone}
              onChange={handleChange}
              error={errors.organizationPhone}
              placeholder="Enter organization phone"
            />
            <CommonInput
              id="organizationAddress"
              label="Organization Address"
              name="organizationAddress"
              value={formData.organizationAddress}
              onChange={handleChange}
              error={errors.organizationAddress}
              placeholder="Enter organization address"
            />
            <CommonInput
              id="licenseNumber"
              label="License Number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              error={errors.licenseNumber}
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