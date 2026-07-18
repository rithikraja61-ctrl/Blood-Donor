import { apiRequest } from './apiClient';

export async function searchDonors(bloodGroup, options = {}) {
  const {
    pinCode,
    latitude,
    longitude,
    radiusKm,
    limit = 50,
    nextCursor = null,
  } = options;

  const params = new URLSearchParams({
    bloodGroup,
    limit: String(limit),
  });

  if (pinCode) {
    params.set('pinCode', pinCode);
  }
  if (latitude != null && longitude != null) {
    params.set('latitude', String(latitude));
    params.set('longitude', String(longitude));
  }
  if (radiusKm != null) {
    params.set('radiusKm', String(radiusKm));
  }
  if (nextCursor) {
    params.set('nextCursor', nextCursor);
  }

  const res = await apiRequest(`/donors/search?${params.toString()}`);
  return res.data;
}
