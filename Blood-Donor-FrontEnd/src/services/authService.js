import {
  BLOOD_GROUP_TO_TYPE,
  ROLE_TO_ACCOUNT_TYPE,
  ROLE_TO_SIGNUP_ENDPOINT,
} from '../utils/constants';
import { apiRequest } from './apiClient';

function buildSignupPayload(role, formData) {
  const pincode = formData.pincode.trim();

  if (role === 'User' || role === 'Donor') {
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phone.trim(),
      password: formData.password,
      address: formData.address.trim(),
      bloodType: BLOOD_GROUP_TO_TYPE[formData.bloodGroup],
      pincode,
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
      city: formData.hospitalCity.trim(),
      state: formData.hospitalState.trim(),
      licenseNumber: formData.hospitalLicenseNumber.trim(),
      pincode,
    };
  }

  const payload = {
    name: formData.bloodBankName.trim(),
    email: formData.bloodBankEmail.trim(),
    phoneNumber: formData.bloodBankPhone.trim(),
    password: formData.password,
    address: formData.bloodBankAddress.trim(),
    pincode,
  };

  if (formData.licenseNumber.trim()) {
    payload.licenseNumber = formData.licenseNumber.trim();
  }

  return payload;
}

export function mapBackendFieldErrors(fieldErrors, role) {
  if (!fieldErrors) return {};
  const mapped = {};
  const hospitalMap = {
    name: 'hospitalName',
    email: 'hospitalEmail',
    phoneNumber: 'hospitalPhone',
    address: 'hospitalAddress',
    pincode: 'pincode',
    city: 'hospitalCity',
    state: 'hospitalState',
    licenseNumber: 'hospitalLicenseNumber',
  };
  const bloodBankMap = {
    name: 'bloodBankName',
    email: 'bloodBankEmail',
    phoneNumber: 'bloodBankPhone',
    address: 'bloodBankAddress',
    pincode: 'pincode',
    licenseNumber: 'licenseNumber',
  };

  Object.entries(fieldErrors).forEach(([key, msg]) => {
    if (role === 'Hospital' && hospitalMap[key]) {
      mapped[hospitalMap[key]] = msg;
    } else if (role === 'Blood Bank' && bloodBankMap[key]) {
      mapped[bloodBankMap[key]] = msg;
    } else if (key === 'phoneNumber') {
      mapped.phone = msg;
    } else if (key === 'bloodType') {
      mapped.bloodGroup = msg;
    } else {
      mapped[key] = msg;
    }
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