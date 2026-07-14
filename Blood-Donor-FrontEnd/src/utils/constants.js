export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const ROLE_TO_ACCOUNT_TYPE = {
  User: 'USER',
  Donor: 'DONOR',
  Hospital: 'HOSPITAL',
  'Blood Bank': 'BLOOD_BANK',
};

export const ROLE_TO_SIGNUP_ENDPOINT = {
  User: '/auth/user/signup',
  Donor: '/auth/donor/signup',
  Hospital: '/auth/hospital/signup',
  'Blood Bank': '/auth/bloodbank/signup',
};

export const BLOOD_GROUP_TO_TYPE = {
  'A+': 'A_POSITIVE', 'A-': 'A_NEGATIVE',
  'B+': 'B_POSITIVE', 'B-': 'B_NEGATIVE',
  'AB+': 'AB_POSITIVE', 'AB-': 'AB_NEGATIVE',
  'O+': 'O_POSITIVE', 'O-': 'O_NEGATIVE',
};

export const AUTH_TOKEN_KEY = 'bloodDonorToken';
export const AUTH_USER_KEY = 'bloodDonorUser';