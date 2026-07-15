import {
    BLOOD_GROUP_TO_TYPE,
    ROLE_TO_ACCOUNT_TYPE,
    ROLE_TO_SIGNUP_ENDPOINT,
  } from '../utils/constants';
  import { apiRequest } from './apiClient';
  
  function buildSignupPayload(role, formData) {
    if (role === 'User' || role === 'Donor') {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        password: formData.password,
        address: formData.address.trim(),
        pincode: formData.pincode.trim(),
        bloodType: BLOOD_GROUP_TO_TYPE[formData.bloodGroup],
      };
      if (role === 'Donor') {
        payload.city = formData.city.trim();
      }
      return payload;
    }
    if (role === 'Hospital') {
      return {
        name: formData.hospitalName.trim(),
        email: formData.hospitalEmail.trim(),
        phoneNumber: formData.hospitalPhone.trim(),
        password: formData.password,
        address: formData.hospitalAddress.trim(),
      };
    }
    return {
      name: formData.organizationName.trim(),
      email: formData.organizationEmail.trim(),
      phoneNumber: formData.organizationPhone.trim(),
      password: formData.password,
      address: formData.organizationAddress.trim(),
    };
  }
  
  export function mapBackendFieldErrors(fieldErrors, role) {
    if (!fieldErrors) return {};
    const mapped = {};
    const hospitalMap = { name: 'hospitalName', email: 'hospitalEmail', phoneNumber: 'hospitalPhone', address: 'hospitalAddress' };
    const bankMap = { name: 'organizationName', email: 'organizationEmail', phoneNumber: 'organizationPhone', address: 'organizationAddress' };
  
    Object.entries(fieldErrors).forEach(([key, msg]) => {
      if (role === 'Hospital' && hospitalMap[key]) mapped[hospitalMap[key]] = msg;
      else if (role === 'Blood Bank' && bankMap[key]) mapped[bankMap[key]] = msg;
      else if (key === 'phoneNumber') mapped.phone = msg;
      else if (key === 'bloodType') mapped.bloodGroup = msg;
      else mapped[key] = msg;
    });
    return mapped;
  }
  
  export async function loginUser(role, email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        accountType: ROLE_TO_ACCOUNT_TYPE[role],
        email: email.trim(),
        password,
      }),
    });
    return res.data;
  }
  
  export async function registerUser(role, formData) {
    const res = await apiRequest(ROLE_TO_SIGNUP_ENDPOINT[role], {
      method: 'POST',
      body: JSON.stringify(buildSignupPayload(role, formData)),
    });
    return res.data;
  }