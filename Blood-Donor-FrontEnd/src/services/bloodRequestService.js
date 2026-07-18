import { apiRequest } from './apiClient';

function toApiDateTime(value) {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

export async function sendUserBloodRequest(payload) {
  const res = await apiRequest('/users/blood-requests', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      requiredBeforeDateTime: toApiDateTime(payload.requiredBeforeDateTime),
    }),
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

export async function getUserBloodRequestGroupSummary(requestGroupId) {
  const res = await apiRequest(`/users/blood-requests/groups/${requestGroupId}`);
  return res.data;
}

export async function listDonorIncomingRequests() {
  const res = await apiRequest('/donors/blood-requests');
  return res.data;
}

export async function acceptDonorBloodRequest(requestId, location) {
  const options = { method: 'POST' };
  if (location?.latitude != null && location?.longitude != null) {
    options.body = JSON.stringify(location);
    options.headers = { 'Content-Type': 'application/json' };
  }
  const res = await apiRequest(`/donors/blood-requests/${requestId}/accept`, options);
  return res.data;
}

export async function rejectDonorBloodRequest(requestId) {
  const res = await apiRequest(`/donors/blood-requests/${requestId}/reject`, {
    method: 'POST',
  });
  return res.data;
}
