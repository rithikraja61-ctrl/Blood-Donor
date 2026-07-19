import { useCallback, useMemo, useState } from 'react';
import DonorSearchFilters from './DonorSearchFilters';
import NearbyDonorsMap from '../map/NearbyDonorsMap';
import EmptyState from '../common/EmptyState';
import { searchDonorsNearby } from '../../services/donorService';
import { ApiError } from '../../services/apiClient';
import { mapDonorsFromApi } from '../../utils/donorMapper';
import 'leaflet/dist/leaflet.css';
import '../../styles/find-donor.css';

function getInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || '?'
  );
}

function DonorPickerSection({
  bloodGroup,
  pincode,
  liveLocation,
  selectedDonorIds,
  onSelectionChange,
  disabled = false,
}) {
  const [filters, setFilters] = useState({
    bloodGroup: bloodGroup || 'O+',
    pincode: pincode || '',
    availability: 'All',
    radiusKm: 25,
  });
  const [donors, setDonors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = useCallback(async () => {
    setSearchError('');
    if (!liveLocation?.latitude || !liveLocation?.longitude) {
      setSearchError('Capture GPS location first to search donors.');
      return;
    }
    if (!/^[0-9]{6}$/.test(filters.pincode || pincode || '')) {
      setSearchError('Set a valid 6-digit PIN code.');
      return;
    }

    setSearchLoading(true);
    onSelectionChange([]);
    try {
      const data = await searchDonorsNearby({
        bloodGroup: filters.bloodGroup,
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        radiusKm: filters.radiusKm,
        pinCode: filters.pincode || pincode || '',
        limit: 50,
      });
      setDonors(mapDonorsFromApi(data.content));
      setHasSearched(true);
    } catch (err) {
      setDonors([]);
      setHasSearched(true);
      setSearchError(err instanceof ApiError ? err.message : 'Donor search failed.');
    } finally {
      setSearchLoading(false);
    }
  }, [filters, liveLocation, onSelectionChange, pincode]);

  const filteredDonors = useMemo(() => donors.filter((d) => (
    filters.availability === 'All' || d.availability === filters.availability
  )), [donors, filters.availability]);

  const selectableDonors = useMemo(
    () => filteredDonors.filter((d) => d.availability === 'Available'),
    [filteredDonors],
  );

  const toggleDonor = (donorId) => {
    if (disabled) return;
    onSelectionChange(
      selectedDonorIds.includes(donorId)
        ? selectedDonorIds.filter((id) => id !== donorId)
        : [...selectedDonorIds, donorId],
    );
  };

  const selectAllAvailable = () => {
    if (disabled) return;
    onSelectionChange(selectableDonors.map((d) => d.id));
  };

  return (
    <section className="donor-picker">
      <DonorSearchFilters
        bloodGroup={filters.bloodGroup}
        pincode={filters.pincode}
        availability={filters.availability}
        radiusKm={filters.radiusKm}
        onBloodGroupChange={(v) => setFilters((p) => ({ ...p, bloodGroup: v }))}
        onPincodeChange={(v) =>
          setFilters((p) => ({ ...p, pincode: v.replace(/\D/g, '').slice(0, 6) }))
        }
        onAvailabilityChange={(v) => setFilters((p) => ({ ...p, availability: v }))}
        onRadiusChange={(v) => setFilters((p) => ({ ...p, radiusKm: Number(v) }))}
        onReset={() => {
          setFilters({
            bloodGroup: bloodGroup || 'O+',
            pincode: pincode || '',
            availability: 'All',
            radiusKm: 25,
          });
          setDonors([]);
          setHasSearched(false);
          onSelectionChange([]);
          setSearchError('');
        }}
        onSearch={handleSearch}
        loading={searchLoading}
      />

      {searchError && <p className="find-donor-page__error">{searchError}</p>}
      {searchLoading && <p className="find-donor-page__loading">Searching nearby donors…</p>}

      {hasSearched && !searchLoading && (
        <p className="find-donor-page__count">
          {filteredDonors.length} donor(s) within {filters.radiusKm} km
          {selectableDonors.length > 0 && ` · ${selectableDonors.length} available`}
        </p>
      )}

      {(hasSearched || liveLocation) && filteredDonors.length > 0 && (
        <NearbyDonorsMap
          userLatitude={liveLocation?.latitude}
          userLongitude={liveLocation?.longitude}
          donors={filteredDonors}
          selectedDonorIds={selectedDonorIds}
          radiusKm={filters.radiusKm}
          onDonorSelect={toggleDonor}
        />
      )}

      {hasSearched && filteredDonors.length > 0 && (
        <div className="donor-picker__actions">
          <button
            type="button"
            className="find-donor-page__btn find-donor-page__btn--ghost"
            onClick={selectAllAvailable}
            disabled={disabled || selectableDonors.length === 0}
          >
            Select all available ({selectableDonors.length})
          </button>
          <span className="donor-picker__selected-count">
            {selectedDonorIds.length} selected
          </span>
        </div>
      )}

      {hasSearched && filteredDonors.length === 0 && !searchLoading && (
        <EmptyState message="No donors match your search. Try a larger radius." />
      )}

      {filteredDonors.length > 0 && (
        <div className="donor-list donor-picker__list">
          {filteredDonors.map((donor) => {
            const isSelected = selectedDonorIds.includes(donor.id);
            const canSelect = donor.availability === 'Available';
            return (
              <article
                key={donor.id}
                className={`donor-card ${isSelected ? 'donor-card--selected' : ''}`}
              >
                <div className="donor-card__header">
                  {canSelect && (
                    <input
                      type="checkbox"
                      className="donor-card__checkbox"
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => toggleDonor(donor.id)}
                      aria-label={`Select ${donor.name}`}
                    />
                  )}
                  <div className="donor-card__avatar" aria-hidden="true">
                    {getInitials(donor.name)}
                  </div>
                  <div>
                    <p className="donor-card__name">{donor.name}</p>
                    <span className="donor-card__blood">{donor.bloodGroup}</span>
                  </div>
                  <span
                    className={`donor-card__badge ${
                      donor.availability === 'Available'
                        ? 'donor-card__badge--available'
                        : 'donor-card__badge--unavailable'
                    }`}
                  >
                    {donor.availability}
                  </span>
                </div>
                <div className="donor-card__details">
                  <span><strong>City:</strong> {donor.city}</span>
                  <span><strong>PIN:</strong> {donor.pincode}</span>
                  <span><strong>Distance:</strong> {donor.distanceLabel}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default DonorPickerSection;
