import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const MAP_STYLE = { width: '100%', height: '180px', borderRadius: '8px' };

function RequestLocationMap({ latitude, longitude, label = 'Requester location' }) {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    id: 'request-location-map',
    googleMapsApiKey: mapsApiKey || '',
  });

  if (latitude == null || longitude == null) {
    return null;
  }

  if (!mapsApiKey || !isLoaded) {
    return (
      <p className="request-location-map__fallback">
        {label}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </p>
    );
  }

  return (
    <div className="request-location-map">
      <p className="request-location-map__label">{label}</p>
      <GoogleMap
        mapContainerStyle={MAP_STYLE}
        center={{ lat: latitude, lng: longitude }}
        zoom={14}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker position={{ lat: latitude, lng: longitude }} />
      </GoogleMap>
    </div>
  );
}

export default RequestLocationMap;
