import { apiRequest } from './apiClient';

export async function updateUserLiveLocation(latitude, longitude) {
  const res = await apiRequest('/users/me/live-location', {
    method: 'PUT',
    body: JSON.stringify({ latitude, longitude }),
  });
  return res.data;
}

export async function updateDonorLiveLocation(latitude, longitude) {
  const res = await apiRequest('/donors/me/live-location', {
    method: 'PUT',
    body: JSON.stringify({ latitude, longitude }),
  });
  return res.data;
}
