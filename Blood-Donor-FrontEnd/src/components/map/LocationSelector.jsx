import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  EMPTY_LOCATION,
  formatLocationSummary,
  isPincodeQuery,
  normalizeLocation,
} from '../../utils/locationUtils';
import { resolveReverseGeocode, resolveSearchGeocode } from '../../services/clientGeocodeService';
import { suggestGeocodeLocation } from '../../services/geocodeService';
import { ApiError } from '../../services/apiClient';
import OsmMapPicker from './OsmMapPicker';
import './LocationSelector.css';

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 350;

function LocationSelector({
  location = EMPTY_LOCATION,
  onLocationChange,
  error,
  title = 'Select location',
  hint = 'Search by area or PIN code, use GPS, or tap the map to pin your location.',
}) {
  const searchDebounceRef = useRef(null);
  const searchWrapRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [activeLocation, setActiveLocation] = useState(location);

  const hasPosition = activeLocation?.latitude != null && activeLocation?.longitude != null;

  useEffect(() => {
    setActiveLocation(location);
    const summary = formatLocationSummary(location);
    if (summary) {
      setSearchText(summary);
    }
  }, [
    location?.latitude,
    location?.longitude,
    location?.address,
    location?.city,
    location?.state,
    location?.pincode,
    location?.formattedAddress,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyLocation = useCallback((nextLocation) => {
    if (!nextLocation) return;

    const normalized = normalizeLocation(nextLocation);
    setGeoError('');
    setActiveLocation(normalized);
    if (normalized.formattedAddress) {
      setSearchText(normalized.formattedAddress);
    }
    onLocationChange?.(normalized);
    setShowSuggestions(false);
    setPredictions([]);
  }, [onLocationChange]);

  const resolveLocation = useCallback(async (resolver) => {
    setResolving(true);
    setGeoError('');
    try {
      const parsed = await resolver();
      applyLocation(parsed);
    } catch (err) {
      setGeoError(
        err instanceof ApiError
          ? err.message
          : 'Could not fetch address details. Please try again or enter manually.',
      );
    } finally {
      setResolving(false);
    }
  }, [applyLocation]);

  const geocodePincode = useCallback((pincode) => {
    resolveLocation(async () => {
      const parsed = await resolveSearchGeocode(pincode);
      return { ...parsed, pincode: parsed.pincode || pincode };
    });
  }, [resolveLocation]);

  const fetchPredictions = useCallback(async (input) => {
    if (isPincodeQuery(input)) {
      setPredictions([]);
      geocodePincode(input.trim());
      return;
    }

    if (input.length < MIN_SEARCH_LENGTH) {
      setPredictions([]);
      return;
    }

    try {
      const results = await suggestGeocodeLocation(input);
      setPredictions(results);
      setShowSuggestions(results.length > 0);
    } catch {
      setPredictions([]);
      setShowSuggestions(false);
    }
  }, [geocodePincode]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    setShowSuggestions(true);
    setGeoError('');

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (value.trim().length < MIN_SEARCH_LENGTH) {
      setPredictions([]);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchPredictions(value.trim());
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSearchFocus = () => {
    if (predictions.length > 0) {
      setShowSuggestions(true);
    } else if (searchText.trim().length >= MIN_SEARCH_LENGTH) {
      fetchPredictions(searchText.trim());
    }
  };

  const handleSelectPrediction = (prediction) => {
    applyLocation(prediction);
  };

  const reverseGeocode = useCallback((lat, lng) => {
    setActiveLocation((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    resolveLocation(() => resolveReverseGeocode(lat, lng));
  }, [resolveLocation]);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGeoError('GPS is not supported in this browser.');
      return;
    }

    setGpsLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setGpsLoading(false);
        setGeoError('Could not get GPS location. Allow location permission and try again.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <div className="location-selector">
      <div className="location-selector__header">
        <h3 className="location-selector__title">{title}</h3>
        <p className="location-selector__hint">{hint}</p>
      </div>

      <div className="location-selector__actions">
        <button
          type="button"
          className="location-selector__gps-btn"
          onClick={handleUseGps}
          disabled={gpsLoading || resolving}
        >
          {gpsLoading ? 'Getting GPS location…' : 'Use my current location (GPS)'}
        </button>
      </div>

      <div className="location-selector__search" ref={searchWrapRef}>
        <span className="location-selector__search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          className="location-selector__search-input"
          placeholder="Search area, street, landmark, or 6-digit PIN code"
          value={searchText}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && predictions.length > 0}
        />
        {showSuggestions && predictions.length > 0 && (
          <ul className="location-selector__suggestions" role="listbox">
            {predictions.map((prediction) => {
              const key = `${prediction.latitude}-${prediction.longitude}-${prediction.formattedAddress}`;
              const mainText = prediction.address || prediction.city || prediction.formattedAddress;
              const secondaryText = [prediction.city, prediction.state, prediction.pincode]
                .filter(Boolean)
                .join(', ');

              return (
                <li key={key} role="option">
                  <button
                    type="button"
                    className="location-selector__suggestion"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectPrediction(prediction)}
                  >
                    <span className="location-selector__suggestion-main">
                      {mainText}
                    </span>
                    {secondaryText && (
                      <span className="location-selector__suggestion-sub">
                        {secondaryText}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {showSuggestions && searchText.trim().length >= MIN_SEARCH_LENGTH
          && predictions.length === 0
          && !resolving
          && !isPincodeQuery(searchText) && (
          <p className="location-selector__no-results">No places found. Try PIN code, city, or tap the map.</p>
        )}
      </div>

      <OsmMapPicker
        latitude={activeLocation?.latitude}
        longitude={activeLocation?.longitude}
        onLocationChange={reverseGeocode}
        height="300px"
      />

      {(resolving || gpsLoading) && (
        <p className="location-selector__status">Fetching address details…</p>
      )}

      {geoError && <p className="location-selector__error">{geoError}</p>}

      {hasPosition && !resolving && !gpsLoading && (
        <div className="location-selector__summary" aria-live="polite">
          <p className="location-selector__summary-label">Selected location</p>
          <p className="location-selector__summary-address">
            {formatLocationSummary(activeLocation) || 'Location pinned on map'}
          </p>
          <dl className="location-selector__details">
            {activeLocation.address && (
              <>
                <dt>Address</dt>
                <dd>{activeLocation.address}</dd>
              </>
            )}
            {activeLocation.city && (
              <>
                <dt>City</dt>
                <dd>{activeLocation.city}</dd>
              </>
            )}
            {activeLocation.state && (
              <>
                <dt>State</dt>
                <dd>{activeLocation.state}</dd>
              </>
            )}
            {activeLocation.pincode && (
              <>
                <dt>PIN code</dt>
                <dd>{activeLocation.pincode}</dd>
              </>
            )}
            <dt>Coordinates</dt>
            <dd>
              {activeLocation.latitude.toFixed(6)}, {activeLocation.longitude.toFixed(6)}
            </dd>
          </dl>
        </div>
      )}

      {error && <p className="location-selector__error">{error}</p>}
    </div>
  );
}

export default LocationSelector;
