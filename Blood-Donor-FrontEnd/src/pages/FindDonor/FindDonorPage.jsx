import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import DonorSearchFilters from '../../components/donor/DonorSearchFilters';
import NearbyDonorsMap from '../../components/map/NearbyDonorsMap';
import GpsCaptureButton from '../../components/map/GpsCaptureButton';
import { searchDonorsNearby } from '../../services/donorService';
import {
  getUserBloodRequestGroupSummary,
  sendUserBloodRequest,
} from '../../services/bloodRequestService';
import { updateUserLiveLocation } from '../../services/liveLocationService';
import { ApiError } from '../../services/apiClient';
import { mapDonorsFromApi } from '../../utils/donorMapper';
import { useAuth } from '../../context/AuthContext';
import { EMERGENCY_LEVELS, ROUTES } from '../../utils/constants';
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

const REQUEST_INITIAL = {
  contactPersonName: '',
  contactPhoneNumber: '',
  emergencyLevel: 'NORMAL',
  requiredBeforeDateTime: '',
  reasonForBloodRequirement: '',
};

function FindDonorPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    bloodGroup: user?.bloodGroup || 'O+',
    pincode: user?.pincode || '',
    availability: 'All',
    radiusKm: 25,
  });
  const [liveLocation, setLiveLocation] = useState(null);
  const [donors, setDonors] = useState([]);
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestForm, setRequestForm] = useState({
    ...REQUEST_INITIAL,
    contactPersonName: user?.name || '',
    contactPhoneNumber: user?.phoneNumber || '',
  });
  const [sendLoading, setSendLoading] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [groupSummary, setGroupSummary] = useState(null);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      bloodGroup: prev.bloodGroup || user?.bloodGroup || 'O+',
      pincode: prev.pincode || user?.pincode || '',
    }));
    setRequestForm((prev) => ({
      ...prev,
      contactPersonName: prev.contactPersonName || user?.name || '',
      contactPhoneNumber: prev.contactPhoneNumber || user?.phoneNumber || '',
    }));
  }, [user?.bloodGroup, user?.pincode, user?.name, user?.phoneNumber]);

  const loadGroupSummary = useCallback(async (groupId) => {
    try {
      const summary = await getUserBloodRequestGroupSummary(groupId);
      setGroupSummary(summary);
    } catch {
      /* polling errors are non-fatal */
    }
  }, []);

  useEffect(() => {
    if (!activeGroupId) return undefined;
    loadGroupSummary(activeGroupId);
    const timer = setInterval(() => loadGroupSummary(activeGroupId), 8000);
    return () => clearInterval(timer);
  }, [activeGroupId, loadGroupSummary]);

  const handleSearch = useCallback(async () => {
    setError('');
    if (!liveLocation?.latitude || !liveLocation?.longitude) {
      setError('Capture your GPS location first to search donors by radius.');
      return;
    }
    if (!/^[0-9]{6}$/.test(filters.pincode || user?.pincode || '')) {
      setError('Set a valid 6-digit PIN code in your profile or search filters.');
      return;
    }

    setSearchLoading(true);
    setSelectedDonorIds([]);
    setActiveGroupId(null);
    setGroupSummary(null);
    try {
      const data = await searchDonorsNearby({
        bloodGroup: filters.bloodGroup,
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        radiusKm: filters.radiusKm,
        pinCode: filters.pincode || user?.pincode || '',
        limit: 50,
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
  }, [filters, liveLocation, user?.pincode]);

  const filteredDonors = useMemo(() => donors.filter((d) => {
    const matchName = d.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchAvailability =
      filters.availability === 'All' || d.availability === filters.availability;
    return matchName && matchAvailability;
  }), [donors, filters.search, filters.availability]);

  const selectableDonors = useMemo(
    () => filteredDonors.filter((d) => d.availability === 'Available'),
    [filteredDonors],
  );

  const toggleDonorSelection = (donorId) => {
    setSelectedDonorIds((prev) => (
      prev.includes(donorId)
        ? prev.filter((id) => id !== donorId)
        : [...prev, donorId]
    ));
  };

  const selectAllAvailable = () => {
    setSelectedDonorIds(selectableDonors.map((d) => d.id));
  };

  const validateRequestForm = () => {
    if (!user?.bloodGroup) {
      return 'Please set your blood group in your profile before requesting blood.';
    }
    if (!/^[0-9]{6}$/.test(user?.pincode || filters.pincode || '')) {
      return 'Please set a valid 6-digit pincode in your profile.';
    }
    if (!liveLocation?.latitude || !liveLocation?.longitude) {
      return 'Capture your live GPS location before sending a request.';
    }
    if (!requestForm.contactPersonName.trim()) {
      return 'Contact person name is required.';
    }
    if (!/^[0-9]{10,15}$/.test(requestForm.contactPhoneNumber)) {
      return 'Enter a valid contact phone number (10–15 digits).';
    }
    if (!requestForm.requiredBeforeDateTime) {
      return 'Required-by date and time is required.';
    }
    return '';
  };

  const handleSendRequest = async (mode) => {
    setError('');
    const validationError = validateRequestForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const donorIds = mode === 'selected' ? selectedDonorIds : [];
    if (mode === 'selected' && donorIds.length === 0) {
      setError('Select at least one available donor on the map or list.');
      return;
    }
    if (mode === 'all' && selectableDonors.length === 0) {
      setError('No available donors in this radius to send a request.');
      return;
    }

    setSendLoading(true);
    try {
      await updateUserLiveLocation(liveLocation);
      const payload = {
        ...requestForm,
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        radiusKm: filters.radiusKm,
        ...(donorIds.length > 0 ? { donorIds } : {}),
      };
      const responses = await sendUserBloodRequest(payload);
      const groupId = responses[0]?.requestGroupId;
      if (groupId) {
        setActiveGroupId(groupId);
        await loadGroupSummary(groupId);
      }
      setSelectedDonorIds([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send blood request.');
    } finally {
      setSendLoading(false);
    }
  };

  const acceptedDonorIds = useMemo(
    () => (groupSummary?.acceptedDonors || []).map((d) => d.donorId),
    [groupSummary],
  );

  const trackingDonors = useMemo(() => {
    if (!groupSummary?.acceptedDonors?.length) return [];
    return groupSummary.acceptedDonors.map((accepted) => ({
      id: accepted.donorId,
      name: accepted.donorName,
      bloodGroup: accepted.bloodGroup,
      latitude: accepted.latitude,
      longitude: accepted.longitude,
      availability: 'Accepted',
      distanceLabel: 'Accepted donor',
    }));
  }, [groupSummary]);

  const mapDonors = activeGroupId && trackingDonors.length > 0
    ? [...filteredDonors, ...trackingDonors.filter(
      (t) => !filteredDonors.some((d) => d.id === t.id),
    )]
    : filteredDonors;

  return (
    <div className="find-donor-page">
      <PageHeader
        title="Find donors nearby"
        subtitle="Search by radius on the map, pick donors, or broadcast a request to everyone nearby."
      />

      <div className="find-donor-page__gps">
        <GpsCaptureButton
          onCapture={setLiveLocation}
          label="Capture my location (GPS)"
          required
        />
        {liveLocation && (
          <p className="find-donor-page__gps-coords">
            Your location: {liveLocation.latitude.toFixed(5)}, {liveLocation.longitude.toFixed(5)}
          </p>
        )}
      </div>

      <DonorSearchFilters
        search={filters.search}
        bloodGroup={filters.bloodGroup}
        pincode={filters.pincode}
        availability={filters.availability}
        radiusKm={filters.radiusKm}
        onSearchChange={(v) => setFilters((p) => ({ ...p, search: v }))}
        onBloodGroupChange={(v) => setFilters((p) => ({ ...p, bloodGroup: v }))}
        onPincodeChange={(v) =>
          setFilters((p) => ({ ...p, pincode: v.replace(/\D/g, '').slice(0, 6) }))
        }
        onAvailabilityChange={(v) => setFilters((p) => ({ ...p, availability: v }))}
        onRadiusChange={(v) => setFilters((p) => ({ ...p, radiusKm: Number(v) }))}
        onReset={() => {
          setFilters({
            search: '',
            bloodGroup: user?.bloodGroup || 'O+',
            pincode: user?.pincode || '',
            availability: 'All',
            radiusKm: 25,
          });
          setDonors([]);
          setHasSearched(false);
          setSelectedDonorIds([]);
          setError('');
          setActiveGroupId(null);
          setGroupSummary(null);
        }}
        onSearch={handleSearch}
        loading={searchLoading}
      />

      {error && <p className="find-donor-page__error">{error}</p>}
      {searchLoading && <p className="find-donor-page__loading">Searching nearby donors…</p>}

      {hasSearched && !searchLoading && (
        <p className="find-donor-page__count">
          {filteredDonors.length} donor(s) within {filters.radiusKm} km
          {selectableDonors.length > 0 && ` · ${selectableDonors.length} available`}
        </p>
      )}

      {(hasSearched || liveLocation) && (
        <NearbyDonorsMap
          userLatitude={liveLocation?.latitude}
          userLongitude={liveLocation?.longitude}
          donors={mapDonors}
          selectedDonorIds={selectedDonorIds}
          acceptedDonorIds={acceptedDonorIds}
          radiusKm={filters.radiusKm}
          onDonorSelect={toggleDonorSelection}
        />
      )}

      {groupSummary && (
        <section className="find-donor-page__tracking" aria-live="polite">
          <h3>Request status</h3>
          <p>
            Sent to <strong>{groupSummary.totalSent}</strong> donor(s) ·
            {' '}<strong>{groupSummary.acceptedCount}</strong> accepted ·
            {' '}{groupSummary.pendingCount} pending
          </p>
          {groupSummary.acceptedCount > 0 && (
            <p className="find-donor-page__tracking-live">
              Live location of accepted donor(s) is shown on the map (green taxi icon).
            </p>
          )}
        </section>
      )}

      {hasSearched && filteredDonors.length > 0 && (
        <section className="find-donor-page__request">
          <h3>Send blood request</h3>
          <div className="find-donor-page__request-grid">
            <label>
              Contact name
              <input
                type="text"
                value={requestForm.contactPersonName}
                onChange={(e) => setRequestForm((p) => ({ ...p, contactPersonName: e.target.value }))}
              />
            </label>
            <label>
              Contact phone
              <input
                type="tel"
                value={requestForm.contactPhoneNumber}
                onChange={(e) => setRequestForm((p) => ({
                  ...p,
                  contactPhoneNumber: e.target.value.replace(/\D/g, '').slice(0, 15),
                }))}
              />
            </label>
            <label>
              Emergency level
              <select
                value={requestForm.emergencyLevel}
                onChange={(e) => setRequestForm((p) => ({ ...p, emergencyLevel: e.target.value }))}
              >
                {EMERGENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
            <label>
              Required by
              <input
                type="datetime-local"
                value={requestForm.requiredBeforeDateTime}
                onChange={(e) => setRequestForm((p) => ({
                  ...p,
                  requiredBeforeDateTime: e.target.value,
                }))}
              />
            </label>
            <label className="find-donor-page__request-reason">
              Reason (optional)
              <textarea
                rows={2}
                value={requestForm.reasonForBloodRequirement}
                onChange={(e) => setRequestForm((p) => ({
                  ...p,
                  reasonForBloodRequirement: e.target.value,
                }))}
              />
            </label>
          </div>
          <div className="find-donor-page__request-actions">
            <button
              type="button"
              className="find-donor-page__btn find-donor-page__btn--secondary"
              disabled={sendLoading || selectedDonorIds.length === 0}
              onClick={() => handleSendRequest('selected')}
            >
              {sendLoading ? 'Sending…' : `Send to selected (${selectedDonorIds.length})`}
            </button>
            <button
              type="button"
              className="find-donor-page__btn"
              disabled={sendLoading || selectableDonors.length === 0}
              onClick={() => handleSendRequest('all')}
            >
              {sendLoading
                ? 'Sending…'
                : `Send to all in radius (${selectableDonors.length})`}
            </button>
            <button
              type="button"
              className="find-donor-page__btn find-donor-page__btn--ghost"
              onClick={selectAllAvailable}
              disabled={selectableDonors.length === 0}
            >
              Select all available
            </button>
          </div>
        </section>
      )}

      {!hasSearched && !searchLoading && (
        <p className="find-donor-page__hint">
          Capture GPS, set blood group and radius, then search. Update your{' '}
          <Link to={ROUTES.PROFILE}>profile</Link> for PIN code and blood group.
        </p>
      )}

      {hasSearched && filteredDonors.length === 0 && !searchLoading && (
        <EmptyState message="No donors match your search. Try a larger radius or another blood group." />
      )}

      {filteredDonors.length > 0 && (
        <div className="donor-list">
          {filteredDonors.map((donor) => {
            const isSelected = selectedDonorIds.includes(donor.id);
            const isAccepted = acceptedDonorIds.includes(donor.id);
            const canSelect = donor.availability === 'Available';
            return (
              <article
                key={donor.id}
                className={`donor-card ${isSelected ? 'donor-card--selected' : ''} ${isAccepted ? 'donor-card--accepted' : ''}`}
              >
                <div className="donor-card__header">
                  {canSelect && (
                    <input
                      type="checkbox"
                      className="donor-card__checkbox"
                      checked={isSelected}
                      onChange={() => toggleDonorSelection(donor.id)}
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
                    {isAccepted ? 'Accepted' : donor.availability}
                  </span>
                </div>
                <div className="donor-card__details">
                  <span><strong>City:</strong> {donor.city}</span>
                  <span><strong>PIN:</strong> {donor.pincode}</span>
                  <span><strong>Distance:</strong> {donor.distanceLabel}</span>
                  <span><strong>Last donation:</strong> {donor.lastDonation}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FindDonorPage;
