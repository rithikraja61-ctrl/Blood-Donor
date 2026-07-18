import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import DonorSearchFilters from '../../components/donor/DonorSearchFilters';
import LocationPickerMap from '../../components/map/LocationPickerMap';
import { searchDonors } from '../../services/donorService';
import { ApiError } from '../../services/apiClient';
import { mapDonorsFromApi } from '../../utils/donorMapper';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
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

function FindDonorPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    bloodGroup: user?.bloodGroup || 'O+',
    pincode: user?.pincode || '',
    availability: 'All',
    latitude: user?.latitude ?? null,
    longitude: user?.longitude ?? null,
  });
  const [donors, setDonors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      bloodGroup: prev.bloodGroup || user?.bloodGroup || 'O+',
      pincode: prev.pincode || user?.pincode || '',
      latitude: prev.latitude ?? user?.latitude ?? null,
      longitude: prev.longitude ?? user?.longitude ?? null,
    }));
  }, [user?.bloodGroup, user?.pincode, user?.latitude, user?.longitude]);

  const handleSearch = useCallback(async () => {
    setError('');
    setLocationError('');

    const hasCoordinates = filters.latitude != null && filters.longitude != null;
    const hasPincode = /^[0-9]{6}$/.test(filters.pincode);

    if (!hasCoordinates && !hasPincode) {
      setError('Enter a valid 6-digit PIN code or select a location on the map.');
      return;
    }

    setSearchLoading(true);
    try {
      const data = await searchDonors(filters.bloodGroup, {
        pinCode: hasPincode ? filters.pincode : undefined,
        latitude: hasCoordinates ? filters.latitude : undefined,
        longitude: hasCoordinates ? filters.longitude : undefined,
      });
      setDonors(mapDonorsFromApi(data.content));
      setHasSearched(true);
    } catch (err) {
      setDonors([]);
      setHasSearched(true);
      setError(err instanceof ApiError ? err.message : 'Donor search failed.');
    } finally {
      setSearchLoading(false);
    }
  }, [filters.bloodGroup, filters.pincode, filters.latitude, filters.longitude]);

  const filteredDonors = donors.filter((d) => {
    const matchName = d.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchAvailability =
      filters.availability === 'All' || d.availability === filters.availability;
    return matchName && matchAvailability;
  });

  return (
    <div className="find-donor-page">
      <PageHeader
        title="Find donors"
        subtitle="Search by blood group and map location. Nearby donors are ranked by distance."
      />

      <DonorSearchFilters
        search={filters.search}
        bloodGroup={filters.bloodGroup}
        pincode={filters.pincode}
        availability={filters.availability}
        onSearchChange={(v) => setFilters((p) => ({ ...p, search: v }))}
        onBloodGroupChange={(v) => setFilters((p) => ({ ...p, bloodGroup: v }))}
        onPincodeChange={(v) =>
          setFilters((p) => ({ ...p, pincode: v.replace(/\D/g, '').slice(0, 6) }))
        }
        onAvailabilityChange={(v) => setFilters((p) => ({ ...p, availability: v }))}
        onReset={() => {
          setFilters({
            search: '',
            bloodGroup: user?.bloodGroup || 'O+',
            pincode: user?.pincode || '',
            availability: 'All',
            latitude: user?.latitude ?? null,
            longitude: user?.longitude ?? null,
          });
          setDonors([]);
          setHasSearched(false);
          setError('');
          setLocationError('');
        }}
        onSearch={handleSearch}
        loading={searchLoading}
      />

      <LocationPickerMap
        latitude={filters.latitude}
        longitude={filters.longitude}
        onChange={({ latitude, longitude }) => {
          setFilters((prev) => ({ ...prev, latitude, longitude }));
          setLocationError('');
        }}
        error={locationError}
      />

      {error && <p className="find-donor-page__error">{error}</p>}
      {searchLoading && <p className="find-donor-page__loading">Searching…</p>}

      {hasSearched && !searchLoading && (
        <p className="find-donor-page__count">{filteredDonors.length} donor(s) found</p>
      )}

      {!hasSearched && !searchLoading && (
        <p className="find-donor-page__hint">
          Set blood group and pick a search location on the map (or enter PIN), then click Search donors.
          Update your <Link to={ROUTES.PROFILE}>profile</Link> if defaults are empty.
        </p>
      )}

      {hasSearched && filteredDonors.length === 0 && !searchLoading && (
        <EmptyState message="No donors match your search. Try another location or blood group." />
      )}

      {filteredDonors.length > 0 && (
        <div className="donor-list">
          {filteredDonors.map((donor) => (
            <article key={donor.id} className="donor-card">
              <div className="donor-card__header">
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
                <span>
                  <strong>City:</strong> {donor.city}
                </span>
                <span>
                  <strong>PIN:</strong> {donor.pincode}
                </span>
                <span>
                  <strong>Distance:</strong> {donor.distanceLabel}
                </span>
                <span>
                  <strong>Last donation:</strong> {donor.lastDonation}
                </span>
                {donor.phone && (
                  <span>
                    <strong>Phone:</strong> {donor.phone}
                  </span>
                )}
              </div>
              {donor.phone && donor.availability === 'Available' ? (
                <a className="donor-card__btn" href={`tel:${donor.phone}`}>
                  Call donor
                </a>
              ) : (
                <button type="button" className="donor-card__btn" disabled>
                  Not available
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default FindDonorPage;
