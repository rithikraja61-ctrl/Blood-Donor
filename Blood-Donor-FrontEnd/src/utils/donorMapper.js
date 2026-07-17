const DISTANCE_LABELS = {
  SAME_PIN: 'Same pincode',
  NEARBY_PIN: 'Nearby',
  FAR_PIN: 'Far',
};

export function mapDonorFromApi(donor, index) {
  return {
    id: donor.id ?? `${donor.name}-${donor.pinCode}-${index}`,
    name: donor.name,
    bloodGroup: donor.bloodGroup,
    pincode: donor.pinCode,
    city: donor.city || '—',
    phone: donor.phoneNumber,
    availability: donor.availabilityStatus ? 'Available' : 'Unavailable',
    lastDonation: donor.lastDonationDate || '—',
    distanceLabel: DISTANCE_LABELS[donor.distancePriority] || donor.distancePriority || '—',
  };
}

export function mapDonorsFromApi(donors = []) {
  return donors.map(mapDonorFromApi);
}
