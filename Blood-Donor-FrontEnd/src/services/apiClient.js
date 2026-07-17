import { API_BASE_URL } from '../utils/constants';
import { getAuthToken } from '../utils/authStorage';

export class ApiError extends Error {
  constructor(message, fieldErrors = null, status = null) {
    super(message);
    this.name = 'ApiError';
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

async function parseResponse(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new ApiError(
      body?.message || 'Something went wrong',
      body?.data && typeof body.data === 'object' ? body.data : null,
      response.status,
    );
  }

  return body;
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    return parseResponse(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Unable to connect to server. Make sure the backend is running on port 8080.',
      null,
      0,
    );
  }
}
