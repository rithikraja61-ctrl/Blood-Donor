/**
 * Parsed location from Google Places / Geocoder (client-side only).
 * Used for location selection UI — does not affect backend search logic.
 */
export const EMPTY_LOCATION = {
  latitude: null,
  longitude: null,
  address: '',
  city: '',
  state: '',
  pincode: '',
  formattedAddress: '',
};

const PINCODE_REGEX = /^[0-9]{6}$/;

function componentValue(components, type, useShort = false) {
  const match = components.find((c) => c.types.includes(type));
  if (!match) return '';
  return useShort ? match.short_name : match.long_name;
}

function buildStreetLine(components) {
  const parts = [
    componentValue(components, 'subpremise'),
    componentValue(components, 'premise'),
    componentValue(components, 'street_number'),
    componentValue(components, 'route'),
    componentValue(components, 'neighborhood'),
    componentValue(components, 'sublocality_level_1'),
    componentValue(components, 'sublocality'),
  ].filter(Boolean);

  return [...new Set(parts)].join(', ');
}

export function parseAddressComponents(components, latitude, longitude, formattedAddress = '') {
  const safeComponents = components || [];
  const street = buildStreetLine(safeComponents);
  const city =
    componentValue(safeComponents, 'locality')
    || componentValue(safeComponents, 'postal_town')
    || componentValue(safeComponents, 'administrative_area_level_3')
    || componentValue(safeComponents, 'administrative_area_level_2');
  const state = componentValue(safeComponents, 'administrative_area_level_1');
  const pincode = componentValue(safeComponents, 'postal_code');
  const resolvedFormatted = formattedAddress || [street, city, state, pincode].filter(Boolean).join(', ');

  return {
    latitude,
    longitude,
    address: deriveAddressLine({
      address: street,
      formattedAddress: resolvedFormatted,
      city,
      state,
      pincode,
    }),
    city,
    state,
    pincode,
    formattedAddress: resolvedFormatted,
  };
}

export function getLatLngFromGeometry(geometry) {
  const location = geometry?.location;
  if (!location) return { lat: null, lng: null };

  const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
  const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
  return { lat, lng };
}

export function parseGeocoderResult(result) {
  const { lat, lng } = getLatLngFromGeometry(result.geometry);
  if (lat == null || lng == null) return null;

  return parseAddressComponents(
    result.address_components,
    lat,
    lng,
    result.formatted_address || '',
  );
}

export function parsePlaceResult(place) {
  const { lat, lng } = getLatLngFromGeometry(place.geometry);
  if (lat == null || lng == null) return null;

  return parseAddressComponents(
    place.address_components,
    lat,
    lng,
    place.formatted_address || place.name || '',
  );
}

export function formatLocationSummary(location) {
  if (!location) return '';
  if (location.formattedAddress) return location.formattedAddress;

  const parts = [
    location.address,
    [location.city, location.state].filter(Boolean).join(', '),
    location.pincode,
  ].filter(Boolean);

  return parts.join(' — ');
}

/** Build a readable address line from geocoder output (works well for India). */
export function deriveAddressLine({ address, formattedAddress, city, state, pincode }) {
  if (address?.trim()) return address.trim();
  if (!formattedAddress) return '';

  const parts = formattedAddress.split(',').map((part) => part.trim()).filter(Boolean);
  const remaining = parts.filter((part) => {
    if (/^india$/i.test(part)) return false;
    if (city && part === city) return false;
    if (state && (part === state || part.startsWith(`${state} `))) return false;
    if (pincode && part.includes(pincode)) return false;
    return true;
  });

  return remaining.join(', ').trim();
}

/** Normalize location so parent forms always receive fillable address + pincode. */
export function normalizeLocation(location) {
  if (!location) return EMPTY_LOCATION;

  const formattedAddress = location.formattedAddress || '';
  const address = deriveAddressLine({
    address: location.address,
    formattedAddress,
    city: location.city,
    state: location.state,
    pincode: location.pincode,
  });

  return {
    latitude: location.latitude ?? null,
    longitude: location.longitude ?? null,
    address,
    city: location.city || '',
    state: location.state || '',
    pincode: location.pincode || '',
    formattedAddress: formattedAddress || formatLocationSummary({ ...location, address }),
  };
}

export function locationFromFormFields(fields) {
  const parts = [fields.address, fields.city, fields.state, fields.pincode].filter(Boolean);
  return {
    latitude: fields.latitude ?? null,
    longitude: fields.longitude ?? null,
    address: fields.address || '',
    city: fields.city || '',
    state: fields.state || '',
    pincode: fields.pincode || '',
    formattedAddress: parts.join(', '),
  };
}

export function isPincodeQuery(value) {
  return PINCODE_REGEX.test(String(value || '').trim());
}

/** Apply parsed location fields onto signup/profile form state. */
export function applyLocationToFormFields(prev, loc, role) {
  const normalized = normalizeLocation(loc);
  const addressLine = deriveAddressLine({
    address: normalized.address,
    formattedAddress: normalized.formattedAddress,
    city: normalized.city,
    state: normalized.state,
    pincode: normalized.pincode,
  });

  const next = {
    ...prev,
    latitude: normalized.latitude,
    longitude: normalized.longitude,
  };

  if (normalized.pincode) next.pincode = normalized.pincode;

  if (role === 'User' || role === 'Donor') {
    if (addressLine) next.address = addressLine;
    else if (normalized.city) next.address = normalized.city;
    if (normalized.city && role === 'Donor') next.city = normalized.city;
  } else if (role === 'Hospital') {
    if (addressLine) next.hospitalAddress = addressLine;
    if (normalized.city) next.hospitalCity = normalized.city;
    if (normalized.state) next.hospitalState = normalized.state;
  } else if (role === 'Blood Bank') {
    if (addressLine) next.bloodBankAddress = addressLine;
    if (normalized.city) next.bloodBankCity = normalized.city;
    if (normalized.state) next.bloodBankState = normalized.state;
  } else {
    if (addressLine) next.address = addressLine;
    if (normalized.city) next.city = normalized.city;
    if (normalized.state) next.state = normalized.state;
  }

  return next;
}
