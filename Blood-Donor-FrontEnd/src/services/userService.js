import { apiRequest } from './apiClient';

export async function getUserProfile() {
  const res = await apiRequest('/users/me');
  return res.data;
}
