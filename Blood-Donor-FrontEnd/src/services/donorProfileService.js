import { apiRequest } from './apiClient';

export async function getDonorProfile() {
  const res = await apiRequest('/donors/me');
  return res.data;
}

export async function getDonorDashboard() {
  const res = await apiRequest('/donors/dashboard');
  return res.data;
}
