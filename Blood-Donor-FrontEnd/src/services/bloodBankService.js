import { apiRequest } from './apiClient';

function toApiDateTime(value) {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

export async function getBloodBankProfile() {
  const res = await apiRequest('/bloodbanks/me');
  return res.data;
}

export async function updateBloodBankProfile(payload) {
  const res = await apiRequest('/bloodbanks/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function getBloodBankDashboard() {
  const res = await apiRequest('/bloodbanks/dashboard');
  return res.data;
}

export async function getBloodBankInventory() {
  const res = await apiRequest('/bloodbanks/inventory');
  return res.data;
}

export async function updateBloodBankInventory(payload) {
  const res = await apiRequest('/bloodbanks/inventory', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function increaseBloodBankStock(payload) {
  const res = await apiRequest('/bloodbanks/inventory/increase', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function decreaseBloodBankStock(payload) {
  const res = await apiRequest('/bloodbanks/inventory/decrease', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function listBloodBankHospitalRequests() {
  const res = await apiRequest('/bloodbanks/hospital-requests');
  return res.data;
}

export async function getBloodBankHospitalRequest(requestId) {
  const res = await apiRequest(`/bloodbanks/hospital-requests/${requestId}`);
  return res.data;
}

export async function approveBloodBankHospitalRequest(requestId) {
  const res = await apiRequest(`/bloodbanks/hospital-requests/${requestId}/approve`, {
    method: 'POST',
  });
  return res.data;
}

export async function rejectBloodBankHospitalRequest(requestId) {
  const res = await apiRequest(`/bloodbanks/hospital-requests/${requestId}/reject`, {
    method: 'POST',
  });
  return res.data;
}

export async function getBloodBankIssueHistory() {
  const res = await apiRequest('/bloodbanks/issue-history');
  return res.data;
}

export async function listReceivedBloodRequests() {
  const res = await apiRequest('/bloodbanks/received-blood-requests');
  return res.data;
}

export async function acceptReceivedBloodRequest(requestId) {
  const res = await apiRequest(`/bloodbanks/received-blood-requests/${requestId}/accept`, {
    method: 'POST',
  });
  return res.data;
}

export async function rejectReceivedBloodRequest(requestId) {
  const res = await apiRequest(`/bloodbanks/received-blood-requests/${requestId}/reject`, {
    method: 'POST',
  });
  return res.data;
}

export async function sendBloodBankBloodRequest(payload) {
  const res = await apiRequest('/bloodbanks/blood-requests', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      requiredBeforeDateTime: toApiDateTime(payload.requiredBeforeDateTime),
    }),
  });
  return res.data;
}

export async function listSentBloodBankBloodRequests() {
  const res = await apiRequest('/bloodbanks/blood-requests');
  return res.data;
}
