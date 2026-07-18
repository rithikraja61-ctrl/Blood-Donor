import { parseGeocoderResult } from '../utils/locationUtils';
import { reverseGeocodeLocation, searchGeocodeLocation } from './geocodeService';

function mapGeocodeJsonResult(result) {
  const parsed = parseGeocoderResult(result);
  if (!parsed) {
    throw new Error('Could not parse geocoded address');
  }
  return parsed;
}

export function reverseGeocodeWithClient(latitude, longitude) {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.Geocoder) {
      reject(new Error('Google Geocoder is not available'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: latitude, lng: longitude }, region: 'IN' },
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          try {
            resolve(mapGeocodeJsonResult(results[0]));
          } catch (err) {
            reject(err);
          }
          return;
        }
        reject(new Error(`Geocoding failed: ${status}`));
      },
    );
  });
}

export function searchGeocodeWithClient(query) {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.Geocoder) {
      reject(new Error('Google Geocoder is not available'));
      return;
    }

    const normalizedQuery = /^[0-9]{6}$/.test(query.trim()) ? `${query.trim()}, India` : query.trim();
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      {
        address: normalizedQuery,
        componentRestrictions: { country: 'IN' },
        region: 'IN',
      },
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          try {
            resolve(mapGeocodeJsonResult(results[0]));
          } catch (err) {
            reject(err);
          }
          return;
        }
        reject(new Error(`Geocoding failed: ${status}`));
      },
    );
  });
}

export async function resolveReverseGeocode(latitude, longitude) {
  try {
    return await reverseGeocodeLocation(latitude, longitude);
  } catch {
    return reverseGeocodeWithClient(latitude, longitude);
  }
}

export async function resolveSearchGeocode(query) {
  try {
    return await searchGeocodeLocation(query);
  } catch {
    const parsed = await searchGeocodeWithClient(query);
    return { ...parsed, pincode: parsed.pincode || (/^[0-9]{6}$/.test(query.trim()) ? query.trim() : '') };
  }
}
