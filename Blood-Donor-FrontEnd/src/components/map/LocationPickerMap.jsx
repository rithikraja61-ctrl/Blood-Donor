/**
 * @deprecated Use LocationSelector — kept for backward-compatible imports.
 */
import LocationSelector from './LocationSelector';
import { locationFromFormFields } from '../../utils/locationUtils';

function LocationPickerMap({ latitude, longitude, onChange, error, location, onLocationChange }) {
  const value = location || locationFromFormFields({ latitude, longitude });
  const handleChange = onLocationChange || onChange;

  return (
    <LocationSelector
      location={value}
      onLocationChange={handleChange}
      error={error}
    />
  );
}

export default LocationPickerMap;
