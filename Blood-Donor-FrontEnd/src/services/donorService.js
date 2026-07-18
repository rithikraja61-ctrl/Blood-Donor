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

export async function searchDonorsNearby({
  bloodGroup,
  latitude,
  longitude,
  radiusKm = 25,
  pinCode = '',
  limit = 50,
}) {
  const params = new URLSearchParams({
    bloodGroup,
    latitude: String(latitude),
    longitude: String(longitude),
    radiusKm: String(radiusKm),
    limit: String(limit),
  });

  if (pinCode) {
    params.set('pinCode', pinCode);
  }

  const res = await apiRequest(`/donors/search?${params.toString()}`);
  return res.data;
}
