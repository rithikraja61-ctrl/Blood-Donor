import { apiRequest } from './apiClient';

export async function searchDonors(bloodGroup, pinCode, page = 0, size = 50) {
  const params = new URLSearchParams({
    bloodGroup,
    pinCode,
    page: String(page),
    size: String(size),
  });

  const res = await apiRequest(`/donors/search?${params.toString()}`);
  return res.data;
}
