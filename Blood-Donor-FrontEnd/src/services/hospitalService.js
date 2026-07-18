import { apiRequest } from './apiClient';

export async function getHospitalProfile() {
  const res = await apiRequest('/hospitals/me');
  return res.data;
}

export async function updateHospitalProfile(payload) {
  const res = await apiRequest('/hospitals/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function getHospitalDashboard() {
  const res = await apiRequest('/hospitals/dashboard');
  return res.data;
}

export async function createPatient(payload) {
  const res = await apiRequest('/hospitals/patients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function listPatients() {
  const res = await apiRequest('/hospitals/patients');
  return res.data;
}

export async function getPatient(patientId) {
  const res = await apiRequest(`/hospitals/patients/${patientId}`);
  return res.data;
}

export async function updatePatient(patientId, payload) {
  const res = await apiRequest(`/hospitals/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletePatient(patientId) {
  await apiRequest(`/hospitals/patients/${patientId}`, { method: 'DELETE' });
}

export async function sendBloodBankRequest(payload) {
  const res = await apiRequest('/hospitals/blood-bank-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function listBloodBanksForHospital() {
  const res = await apiRequest('/hospitals/blood-banks');
  return res.data;
}

export async function sendHospitalBloodRequest(payload) {
  const res = await apiRequest('/hospitals/blood-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function listHospitalBloodRequests() {
  const res = await apiRequest('/hospitals/blood-requests');
  return res.data;
}

export async function getHospitalBloodRequest(requestId) {
  const res = await apiRequest(`/hospitals/blood-requests/${requestId}`);
  return res.data;
}

export async function getAssignedDonorForPatient(patientId) {
  const res = await apiRequest(`/hospitals/patients/${patientId}/assigned-donor`);
  return res.data;
}
