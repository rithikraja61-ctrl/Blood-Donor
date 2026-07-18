import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import {
  EMPTY_LOCATION,
  formatLocationSummary,
  isPincodeQuery,
  normalizeLocation,
  parsePlaceResult,
} from '../../utils/locationUtils';
import { resolveReverseGeocode, resolveSearchGeocode } from '../../services/clientGeocodeService';
import { ApiError } from '../../services/apiClient';
import './LocationSelector.css';

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
};
const GOOGLE_MAP_LIBRARIES = ['places'];
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 350;

function LocationSelector({
  location = EMPTY_LOCATION,
  onLocationChange,
  error,
  title = 'Select location',
  hint = 'Search by area or PIN code, use GPS, or tap the map to pin your location.',
}) {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const searchWrapRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapAuthError, setMapAuthError] = useState('');
  const [geoError, setGeoError] = useState('');
  const [activeLocation, setActiveLocation] = useState(location);

  useEffect(() => {
    window.gm_authFailure = () => {
      setMapAuthError(
        'Google Maps could not load. Enable Maps JavaScript API and Places API on your browser key.',
      );
    };
    return () => {
      window.gm_authFailure = undefined;
    };
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'blood-donor-google-map',
    googleMapsApiKey: mapsApiKey || '',
    libraries: GOOGLE_MAP_LIBRARIES,
  });

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

  const panMapTo = useCallback((lat, lng) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    }
  }, []);

  const applyLocation = useCallback((nextLocation) => {
    if (!nextLocation) return;

    const normalized = normalizeLocation(nextLocation);
    setGeoError('');
    setActiveLocation(normalized);
    if (normalized.formattedAddress) {
      setSearchText(normalized.formattedAddress);
    }
    if (normalized.latitude != null && normalized.longitude != null) {
      panMapTo(normalized.latitude, normalized.longitude);
    }
    onLocationChange?.(normalized);
    setShowSuggestions(false);
  }, [onLocationChange, panMapTo]);

  const initPlacesServices = useCallback((map) => {
    mapRef.current = map;

    if (!window.google?.maps?.places) return;

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    }
  }, []);

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

  const fetchPredictions = useCallback((input) => {
    if (isPincodeQuery(input)) {
      setPredictions([]);
      geocodePincode(input.trim());
      return;
    }

    if (!autocompleteServiceRef.current || input.length < MIN_SEARCH_LENGTH) {
      setPredictions([]);
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'in' },
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowSuggestions(true);
        } else {
          setPredictions([]);
        }
      },
    );
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
    if (!placesServiceRef.current) return;

    setResolving(true);
    setShowSuggestions(false);
    setSearchText(prediction.description);
    setGeoError('');

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      },
      (place, status) => {
        setResolving(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const parsed = parsePlaceResult(place);
          if (parsed) {
            applyLocation(parsed);
            return;
          }
        }
        setGeoError('Could not load place details. Try another suggestion or tap the map.');
        setPredictions([]);
      },
    );
  };

  const reverseGeocode = useCallback((lat, lng) => {
    setActiveLocation((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    panMapTo(lat, lng);
    resolveLocation(() => resolveReverseGeocode(lat, lng));
  }, [panMapTo, resolveLocation]);

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

  const handleMapClick = (event) => {
    reverseGeocode(event.latLng.lat(), event.latLng.lng());
  };

  const handleMarkerDragEnd = (event) => {
    reverseGeocode(event.latLng.lat(), event.latLng.lng());
  };

  if (!mapsApiKey) {
    return (
      <div className="location-selector location-selector--error">
        Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in your environment.
      </div>
    );
  }

  if (loadError || mapAuthError) {
    return (
      <div className="location-selector location-selector--error">
        {mapAuthError || 'Failed to load Google Maps. Enable Maps JavaScript API and Places API on your browser key.'}
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="location-selector location-selector--loading">Loading location picker…</div>;
  }

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
            {predictions.map((prediction) => (
              <li key={prediction.place_id} role="option">
                <button
                  type="button"
                  className="location-selector__suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectPrediction(prediction)}
                >
                  <span className="location-selector__suggestion-main">
                    {prediction.structured_formatting?.main_text || prediction.description}
                  </span>
                  {prediction.structured_formatting?.secondary_text && (
                    <span className="location-selector__suggestion-sub">
                      {prediction.structured_formatting.secondary_text}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        {showSuggestions && searchText.trim().length >= MIN_SEARCH_LENGTH
          && predictions.length === 0
          && !resolving
          && !isPincodeQuery(searchText) && (
          <p className="location-selector__no-results">No places found. Try PIN code, city, or tap the map.</p>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={hasPosition
          ? { lat: activeLocation.latitude, lng: activeLocation.longitude }
          : DEFAULT_CENTER}
        zoom={hasPosition ? 15 : 5}
        onLoad={initPlacesServices}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {hasPosition && (
          <Marker
            position={{ lat: activeLocation.latitude, lng: activeLocation.longitude }}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>

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
