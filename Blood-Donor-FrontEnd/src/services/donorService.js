import { apiRequest } from './apiClient';

export async function searchDonors(bloodGroup, pinCode, limit = 50, nextCursor = null) {
  const params = new URLSearchParams({
    bloodGroup,
    pinCode,
    limit: String(limit),
  });

  if (nextCursor) {
    params.set('nextCursor', nextCursor);
  }

  const res = await apiRequest(`/donors/search?${params.toString()}`);
  return res.data;
}
