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

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/** Default red-cell shelf life used when adding inventory (matches backend) */
export const DEFAULT_BLOOD_SHELF_LIFE_DAYS = 42;

export function defaultBloodExpiryDateString() {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_BLOOD_SHELF_LIFE_DAYS);
  return d.toISOString().slice(0, 10);
}

export const BLOOD_GROUP_FILTER_OPTIONS = ['All', ...BLOOD_GROUPS];

export const BLOOD_GROUP_TO_TYPE = {
  'A+': 'A_POSITIVE', 'A-': 'A_NEGATIVE',
  'B+': 'B_POSITIVE', 'B-': 'B_NEGATIVE',
  'AB+': 'AB_POSITIVE', 'AB-': 'AB_NEGATIVE',
  'O+': 'O_POSITIVE', 'O-': 'O_NEGATIVE',
};

export const TYPE_TO_BLOOD_GROUP = Object.fromEntries(
  Object.entries(BLOOD_GROUP_TO_TYPE).map(([group, type]) => [type, group]),
);

export const AUTH_TOKEN_KEY = 'bloodDonorToken';
export const AUTH_USER_KEY = 'bloodDonorUser';

export const ROLES = {
  USER: 'USER',
  DONOR: 'DONOR',
  HOSPITAL: 'HOSPITAL',
  BLOOD_BANK: 'BLOOD_BANK',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  USER_HOME: '/user-home',
  FIND_DONOR: '/find-donor',
  REQUEST_BLOOD: '/request-blood',
  MY_REQUESTS: '/my-requests',
  PROFILE: '/profile',
  DONOR_HOME: '/donor-home',
  DONOR_REQUESTS: '/donor-requests',
  DONOR_PROFILE: '/donor-profile',
  HOSPITAL_HOME: '/hospital-home',
  HOSPITAL_PROFILE: '/hospital-profile',
  HOSPITAL_PATIENTS: '/hospital-patients',
  HOSPITAL_SEND_REQUEST: '/hospital/send-request',
  HOSPITAL_REQUESTS: '/hospital-requests',
  HOSPITAL_BLOOD_BANK_REQUEST: '/hospital/blood-bank-request',
  BLOOD_BANK_HOME: '/blood-bank-home',
  BLOOD_BANK_PROFILE: '/blood-bank-profile',
  BLOOD_BANK_INVENTORY: '/blood-bank-inventory',
  BLOOD_BANK_HOSPITAL_REQUESTS: '/blood-bank-hospital-requests',
  BLOOD_BANK_ISSUE_HISTORY: '/blood-bank-issue-history',
};

export const EMERGENCY_LEVELS = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'CRITICAL', label: 'Critical' },
];

export const PATIENT_REQUEST_STATUS_LABELS = {
  WAITING: 'Waiting for donor',
  DONOR_RECEIVED: 'Donor received',
};

export const BLOOD_REQUEST_STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  COMPLETED: 'Completed',
};

export const HOSPITAL_BLOOD_BANK_REQUEST_STATUS_LABELS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
};