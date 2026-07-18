export function getCurrentGpsPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS is not supported in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => reject(new Error('Could not get GPS location. Allow location permission and try again.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export function formatDistanceKm(distanceKm) {
  if (distanceKm == null || Number.isNaN(distanceKm)) {
    return 'Distance unavailable';
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}
