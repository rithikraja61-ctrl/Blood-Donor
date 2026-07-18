import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import './LocationPickerMap.css';

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '280px',
  borderRadius: '8px',
};

function LocationPickerMap({ latitude, longitude, onChange, error }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'blood-donor-google-map',
    googleMapsApiKey: apiKey || '',
  });

  const hasPosition = latitude != null && longitude != null;
  const center = hasPosition
    ? { lat: latitude, lng: longitude }
    : DEFAULT_CENTER;

  const handleMapClick = (event) => {
    if (!onChange) return;
    onChange({
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng(),
    });
  };

  const handleMarkerDragEnd = (event) => {
    if (!onChange) return;
    onChange({
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng(),
    });
  };

  if (!apiKey) {
    return (
      <div className="location-picker-map location-picker-map--error">
        Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in your environment.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="location-picker-map location-picker-map--error">
        Failed to load Google Maps. Check your API key and billing settings.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="location-picker-map location-picker-map--loading">Loading map…</div>;
  }

  return (
    <div className="location-picker-map">
      <p className="location-picker-map__hint">
        Click the map or drag the pin to set your exact location.
      </p>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={hasPosition ? 14 : 5}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {hasPosition && (
          <Marker
            position={{ lat: latitude, lng: longitude }}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>
      {hasPosition && (
        <p className="location-picker-map__coords">
          Selected: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
      {error && <p className="location-picker-map__error">{error}</p>}
    </div>
  );
}

export default LocationPickerMap;
