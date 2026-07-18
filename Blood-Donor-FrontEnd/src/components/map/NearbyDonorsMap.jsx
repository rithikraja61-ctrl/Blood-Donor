import { useEffect, useMemo } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import './leafletSetup';

const DEFAULT_CENTER = [20.5937, 78.9629];

const userIcon = L.divIcon({
  className: 'nearby-map-marker nearby-map-marker--user',
  html: '<span class="nearby-map-marker__emoji" aria-hidden="true">📍</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function createDonorIcon({ selected, accepted }) {
  let modifier = 'nearby-map-marker--donor';
  if (accepted) modifier = 'nearby-map-marker--accepted';
  else if (selected) modifier = 'nearby-map-marker--selected';

  return L.divIcon({
    className: `nearby-map-marker ${modifier}`,
    html: '<span class="nearby-map-marker__emoji" aria-hidden="true">🚕</span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function MapViewController({ latitude, longitude, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (latitude == null || longitude == null) return;
    map.setView([latitude, longitude], zoom, { animate: true });
  }, [latitude, longitude, zoom, map]);
  return null;
}

function NearbyDonorsMap({
  userLatitude,
  userLongitude,
  donors = [],
  selectedDonorIds = [],
  acceptedDonorIds = [],
  radiusKm = 25,
  height = '360px',
  onDonorSelect,
}) {
  const mapDonors = useMemo(
    () => donors.filter((d) => d.latitude != null && d.longitude != null),
    [donors],
  );

  const hasUser = userLatitude != null && userLongitude != null;
  const center = hasUser ? [userLatitude, userLongitude] : DEFAULT_CENTER;
  const zoom = hasUser ? 12 : 5;
  const radiusMeters = radiusKm * 1000;

  return (
    <div className="nearby-donors-map" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewController latitude={userLatitude} longitude={userLongitude} zoom={zoom} />

        {hasUser && (
          <>
            <Marker position={[userLatitude, userLongitude]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={[userLatitude, userLongitude]}
              radius={radiusMeters}
              pathOptions={{ color: '#c62828', fillColor: '#c62828', fillOpacity: 0.08, weight: 2 }}
            />
          </>
        )}

        {mapDonors.map((donor) => {
          const selected = selectedDonorIds.includes(donor.id);
          const accepted = acceptedDonorIds.includes(donor.id);
          return (
            <Marker
              key={donor.id}
              position={[donor.latitude, donor.longitude]}
              icon={createDonorIcon({ selected, accepted })}
              eventHandlers={{
                click: () => onDonorSelect?.(donor.id),
              }}
            >
              <Popup>
                <strong>{donor.name}</strong>
                <br />
                {donor.bloodGroup} · {donor.distanceLabel}
                <br />
                {donor.availability}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default NearbyDonorsMap;
