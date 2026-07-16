export function formatRole(role) {
  const labels = {
    USER: 'User',
    DONOR: 'Donor',
    HOSPITAL: 'Hospital',
    BLOOD_BANK: 'Blood Bank',
  };
  return labels[role] || role;
}

export function getUserInitials(name, email) {
  if (name?.trim()) {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  return email?.charAt(0).toUpperCase() || 'U';
}
