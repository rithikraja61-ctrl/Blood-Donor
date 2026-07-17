import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DonorSearchFilters from '../../components/donor/DonorSearchFilters';
import {
  BLOOD_GROUP_TO_TYPE,
  EMERGENCY_LEVELS,
} from '../../utils/constants';
import { searchDonors } from '../../services/donorService';
import {
  getHospitalProfile,
  listPatients,
  sendHospitalBloodRequest,
} from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import { mapDonorsFromApi } from '../../utils/donorMapper';
import '../../styles/find-donor.css';
import './HospitalSendRequestPage.css';

function toLocalDateTimeInputValue(date) {
  const d = date || new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function HospitalSendRequestPage() {
  const location = useLocation();
  const preselectedPatientId = location.state?.patientId;

  const [patients, setPatients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [filters, setFilters] = useState({ search: '', bloodGroup: 'O+', pincode: '', availability: 'All' });
  const [donors, setDonors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [emergencyLevel, setEmergencyLevel] = useState('NORMAL');
  const [requiredBeforeDateTime, setRequiredBeforeDateTime] = useState(toLocalDateTimeInputValue());
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.id) === String(patientId)),
    [patients, patientId],
  );

  const loadInitial = useCallback(async () => {
    try {
      const [patientList, hospitalProfile] = await Promise.all([
        listPatients(),
        getHospitalProfile(),
      ]);
      setPatients(patientList);
      setProfile(hospitalProfile);
      if (preselectedPatientId) {
        setPatientId(String(preselectedPatientId));
      }
      if (hospitalProfile?.pincode) {
        setFilters((f) => ({ ...f, pincode: hospitalProfile.pincode }));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data.');
    }
  }, [preselectedPatientId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (selectedPatient?.bloodGroup) {
      setFilters((f) => ({ ...f, bloodGroup: selectedPatient.bloodGroup }));
    }
  }, [selectedPatient?.bloodGroup]);

  const handleSearchDonors = async () => {
    setError('');
    if (!/^[0-9]{6}$/.test(filters.pincode)) {
      setError('Enter a valid 6-digit PIN code.');
      return;
    }
    setSearchLoading(true);
    setSelectedDonorId(null);
    try {
      const data = await searchDonors(filters.bloodGroup, filters.pincode);
      setDonors(mapDonorsFromApi(data.content));
      setHasSearched(true);
    } catch (err) {
      setDonors([]);
      setHasSearched(true);
      setError(err instanceof ApiError ? err.message : 'Donor search failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  const filteredDonors = donors.filter((d) => {
    const matchName = d.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchAvailability =
      filters.availability === 'All' || d.availability === filters.availability;
    return matchName && matchAvailability;
  });

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!patientId) {
      setError('Select a patient.');
      return;
    }
    if (!selectedDonorId) {
      setError('Select a donor from search results.');
      return;
    }

    setSubmitLoading(true);
    try {
      const p = selectedPatient;
      await sendHospitalBloodRequest({
        patientId: Number(patientId),
        selectedDonorId: Number(selectedDonorId),
        patientName: p?.patientName,
        patientAge: p?.age,
        patientGender: p?.gender,
        requiredBloodGroup: p?.bloodType || BLOOD_GROUP_TO_TYPE[filters.bloodGroup],
        reasonForBloodRequirement: p?.reasonForBlood,
        emergencyLevel,
        requiredBeforeDateTime: requiredBeforeDateTime.length === 16
          ? `${requiredBeforeDateTime}:00`
          : requiredBeforeDateTime,
      });
      setSuccess('Blood request sent successfully. Donor will see it in incoming requests.');
      setSelectedDonorId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="find-donor-page hospital-send-request">
      <PageHeader
        title="Send blood request"
        subtitle="1) Search donors 2) Select one donor 3) Confirm and send — donor ID is set automatically."
      />

      <section className="hospital-send-request__patient">
        <label htmlFor="patientSelect">Patient</label>
        <select
          id="patientSelect"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.patientName} ({p.bloodGroup})
            </option>
          ))}
        </select>
        {selectedPatient && (
          <p className="hospital-send-request__patient-meta">
            {selectedPatient.patientName}, age {selectedPatient.age} — {selectedPatient.reasonForBlood}
          </p>
        )}
      </section>

      <DonorSearchFilters
        search={filters.search}
        bloodGroup={filters.bloodGroup}
        pincode={filters.pincode}
        availability={filters.availability}
        onSearchChange={(v) => setFilters((p) => ({ ...p, search: v }))}
        onBloodGroupChange={(v) => setFilters((p) => ({ ...p, bloodGroup: v }))}
        onPincodeChange={(v) => setFilters((p) => ({ ...p, pincode: v.replace(/\D/g, '').slice(0, 6) }))}
        onAvailabilityChange={(v) => setFilters((p) => ({ ...p, availability: v }))}
        onReset={() => {
          setFilters({
            search: '',
            bloodGroup: selectedPatient?.bloodGroup || 'O+',
            pincode: profile?.pincode || '',
            availability: 'All',
          });
          setDonors([]);
          setHasSearched(false);
          setSelectedDonorId(null);
        }}
        onSearch={handleSearchDonors}
        loading={searchLoading}
      />

      {error && <p className="find-donor-page__error">{error}</p>}
      {success && <p className="hospital-send-request__success">{success}</p>}

      {hasSearched && (
        <p className="find-donor-page__count">{filteredDonors.length} donor(s) — click Select</p>
      )}

      <ul className="hospital-send-request__donors">
        {filteredDonors.map((donor) => (
          <li
            key={donor.id}
            className={`hospital-send-request__donor-card ${
              selectedDonorId === donor.id ? 'hospital-send-request__donor-card--selected' : ''
            }`}
          >
            <div>
              <strong>{donor.name}</strong> · {donor.bloodGroup} · {donor.city} · {donor.pincode}
              <br />
              <small>{donor.distanceLabel} · {donor.availability}</small>
            </div>
            <button
              type="button"
              disabled={donor.availability !== 'Available'}
              onClick={() => setSelectedDonorId(donor.id)}
            >
              {selectedDonorId === donor.id ? 'Selected' : 'Select donor'}
            </button>
          </li>
        ))}
      </ul>

      {selectedDonorId && (
        <form className="hospital-send-request__confirm" onSubmit={handleSendRequest}>
          <h3>Confirm request</h3>
          <p>
            Selected donor ID: <strong>{selectedDonorId}</strong> (from search, not typed manually)
          </p>
          <label htmlFor="emergency">Emergency level</label>
          <select id="emergency" value={emergencyLevel} onChange={(e) => setEmergencyLevel(e.target.value)}>
            {EMERGENCY_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>
          <label htmlFor="requiredBy">Required before</label>
          <input
            id="requiredBy"
            type="datetime-local"
            value={requiredBeforeDateTime}
            onChange={(e) => setRequiredBeforeDateTime(e.target.value)}
            required
          />
          <button type="submit" className="auth-form__submit" disabled={submitLoading}>
            {submitLoading ? 'Sending…' : 'Send blood request'}
          </button>
        </form>
      )}
    </div>
  );
}

export default HospitalSendRequestPage;
