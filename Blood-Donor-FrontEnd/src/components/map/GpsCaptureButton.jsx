import { useState } from 'react';
import { getCurrentGpsPosition } from '../../utils/gpsUtils';
import './GpsCaptureButton.css';

function GpsCaptureButton({
  label = 'Use my current location (GPS)',
  capturedLabel = 'Live location captured',
  onCapture,
  required = false,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);

  const handleCapture = async () => {
    setLoading(true);
    setError('');
    try {
      const position = await getCurrentGpsPosition();
      setCoords(position);
      onCapture?.(position);
    } catch (err) {
      setError(err.message || 'Could not capture GPS location.');
      setCoords(null);
      onCapture?.(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gps-capture">
      <button
        type="button"
        className="gps-capture__btn"
        onClick={handleCapture}
        disabled={disabled || loading}
      >
        {loading ? 'Getting GPS location…' : label}
      </button>
      {required && !coords && (
        <p className="gps-capture__hint">GPS location is required before sending or accepting.</p>
      )}
      {coords && (
        <p className="gps-capture__success">
          {capturedLabel}: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
        </p>
      )}
      {error && <p className="gps-capture__error">{error}</p>}
    </div>
  );
}

export default GpsCaptureButton;
