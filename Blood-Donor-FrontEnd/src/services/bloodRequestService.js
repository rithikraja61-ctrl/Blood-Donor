import { apiRequest } from './apiClient';

export async function sendUserBloodRequest(payload) {
  const res = await apiRequest('/users/blood-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function listUserBloodRequests() {
  const res = await apiRequest('/users/blood-requests');
  return res.data;
}

export async function getUserBloodRequestStatus(requestId) {
  const res = await apiRequest(`/users/blood-requests/${requestId}`);
  return res.data;
}

export async function listDonorIncomingRequests() {
  const res = await apiRequest('/donors/blood-requests');
  return res.data;
}

export async function acceptDonorBloodRequest(requestId) {
  const res = await apiRequest(`/donors/blood-requests/${requestId}/accept`, {
    method: 'POST',
  });
  return res.data;
}

export async function rejectDonorBloodRequest(requestId) {
  const res = await apiRequest(`/donors/blood-requests/${requestId}/reject`, {
    method: 'POST',
  });
  return res.data;
}
