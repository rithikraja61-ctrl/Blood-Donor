const DISTANCE_LABELS = {
  SAME_PIN: 'Same pincode',
  NEARBY_PIN: 'Nearby',
  FAR_PIN: 'Far',
};

export function mapDonorFromApi(donor, index) {
  const distanceLabel = donor.distanceKm != null
    ? `${donor.distanceKm} km away`
    : DISTANCE_LABELS[donor.distancePriority] || donor.distancePriority || '—';

  return {
    id: donor.id ?? `${donor.name}-${donor.pinCode}-${index}`,
    name: donor.name,
    bloodGroup: donor.bloodGroup,
    pincode: donor.pinCode,
    city: donor.city || '—',
    phone: donor.phoneNumber,
    latitude: donor.latitude,
    longitude: donor.longitude,
    distanceKm: donor.distanceKm,
    availability: donor.availabilityStatus ? 'Available' : 'Unavailable',
    lastDonation: donor.lastDonationDate || '—',
    distanceLabel,
  };
}

export function mapDonorsFromApi(donors = []) {
  return donors.map(mapDonorFromApi);
}
