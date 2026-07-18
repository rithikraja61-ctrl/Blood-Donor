import OsmMapPicker from './OsmMapPicker';

function RequestLocationMap({ latitude, longitude, label = 'Requester location' }) {
  if (latitude == null || longitude == null) {
    return null;
  }

  return (
    <div className="request-location-map">
      <p className="request-location-map__label">{label}</p>
      <OsmMapPicker
        latitude={latitude}
        longitude={longitude}
        height="180px"
        interactive={false}
        draggableMarker={false}
      />
    </div>
  );
}

export default RequestLocationMap;
