import { apiRequest } from './apiClient';

function mapGeocodedLocation(data) {
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    pincode: data.pincode || '',
    formattedAddress: data.formattedAddress || '',
  };
}

export async function reverseGeocodeLocation(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const res = await apiRequest(`/geocode/reverse?${params.toString()}`);
  return mapGeocodedLocation(res.data);
}

export async function searchGeocodeLocation(query) {
  const params = new URLSearchParams({ query });
  const res = await apiRequest(`/geocode/search?${params.toString()}`);
  return mapGeocodedLocation(res.data);
}

export async function suggestGeocodeLocation(query) {
  const params = new URLSearchParams({ query });
  const res = await apiRequest(`/geocode/suggest?${params.toString()}`);
  return (res.data || []).map(mapGeocodedLocation);
}
