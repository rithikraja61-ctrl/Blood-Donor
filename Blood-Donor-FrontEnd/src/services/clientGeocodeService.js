import { reverseGeocodeLocation, searchGeocodeLocation } from './geocodeService';

export async function resolveReverseGeocode(latitude, longitude) {
  return reverseGeocodeLocation(latitude, longitude);
}

export async function resolveSearchGeocode(query) {
  const parsed = await searchGeocodeLocation(query);
  return {
    ...parsed,
    pincode: parsed.pincode || (/^[0-9]{6}$/.test(query.trim()) ? query.trim() : ''),
  };
}
