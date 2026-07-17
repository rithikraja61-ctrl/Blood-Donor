import { apiRequest } from './apiClient';

export async function getUserProfile() {
  const res = await apiRequest('/users/me');
  return res.data;
}

export async function updateUserProfile(payload) {
  const res = await apiRequest('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}
