import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import './leafletSetup';

const DEFAULT_CENTER = [20.5937, 78.9629];

function MapViewController({ latitude, longitude, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    map.setView([latitude, longitude], zoom, { animate: true });
  }, [latitude, longitude, zoom, map]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick?.(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function OsmMapPicker({
  latitude,
  longitude,
  onLocationChange,
  height = '300px',
  defaultZoom = 5,
  selectedZoom = 15,
  interactive = true,
  draggableMarker = true,
  className = '',
}) {
  const hasPosition = latitude != null && longitude != null;
  const center = hasPosition ? [latitude, longitude] : DEFAULT_CENTER;
  const zoom = hasPosition ? selectedZoom : defaultZoom;

  return (
    <div className={`osm-map-picker ${className}`.trim()} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        scrollWheelZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewController latitude={latitude} longitude={longitude} zoom={zoom} />
        {interactive && onLocationChange && <MapClickHandler onMapClick={onLocationChange} />}
        {hasPosition && (
          <Marker
            position={[latitude, longitude]}
            draggable={draggableMarker && interactive && !!onLocationChange}
            eventHandlers={{
              dragend(event) {
                const { lat, lng } = event.target.getLatLng();
                onLocationChange?.(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default OsmMapPicker;
