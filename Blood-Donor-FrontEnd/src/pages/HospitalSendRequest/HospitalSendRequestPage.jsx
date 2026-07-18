import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { EMERGENCY_LEVELS, ROUTES } from '../../utils/constants';
import {
  getHospitalProfile,
  listPatients,
  sendHospitalBloodRequest,
} from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import '../BloodRequest/BloodRequestPage.css';
import './HospitalSendRequestPage.css';

const INITIAL = {
  contactPersonName: '',
  contactPhoneNumber: '',
  emergencyLevel: 'NORMAL',
  requiredBeforeDateTime: '',
  reasonForBloodRequirement: '',
};

function HospitalSendRequestPage() {
  const location = useLocation();
  const preselectedPatientId = location.state?.patientId;

  const [patients, setPatients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [form, setForm] = useState(INITIAL);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

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
      setForm((prev) => ({
        ...prev,
        contactPersonName: hospitalProfile?.name || '',
        contactPhoneNumber: hospitalProfile?.phoneNumber || '',
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data.');
    }
  }, [preselectedPatientId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (selectedPatient?.reasonForBlood) {
      setForm((prev) => ({
        ...prev,
        reasonForBloodRequirement: selectedPatient.reasonForBlood,
      }));
    }
  }, [selectedPatient?.reasonForBlood]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'contactPhoneNumber') {
      next = value.replace(/\D/g, '').slice(0, 15);
    }
    setForm((prev) => ({ ...prev, [name]: next }));
    setError('');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!patientId) {
      setError('Select a patient.');
      return;
    }
    if (!form.contactPersonName.trim()) {
      setError('Contact person name is required.');
      return;
    }
    if (!/^[0-9]{10,15}$/.test(form.contactPhoneNumber)) {
      setError('Enter a valid contact phone number (10–15 digits).');
      return;
    }
    if (!form.requiredBeforeDateTime) {
      setError('Required-by date and time is required.');
      return;
    }
    if (!/^[0-9]{6}$/.test(profile?.pincode || '')) {
      setError('Set a valid 6-digit pincode in your hospital profile before sending a request.');
      return;
    }

    setSubmitLoading(true);
    try {
      const responses = await sendHospitalBloodRequest({
        patientId: Number(patientId),
        contactPersonName: form.contactPersonName.trim(),
        contactPhoneNumber: form.contactPhoneNumber,
        emergencyLevel: form.emergencyLevel,
        requiredBeforeDateTime: form.requiredBeforeDateTime,
        reasonForBloodRequirement: form.reasonForBloodRequirement.trim() || undefined,
      });
      setSuccess({
        count: responses.length,
        requestGroupId: responses[0]?.requestGroupId,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="blood-request-page hospital-send-request">
      <PageHeader
        title="Send blood request"
        subtitle="Select a patient — your request is broadcast automatically to eligible donors nearby."
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
            {selectedPatient.patientName}, age {selectedPatient.age} — blood {selectedPatient.bloodGroup}
          </p>
        )}
      </section>

      <div className="blood-request-page__profile">
        <p><strong>Hospital pincode:</strong> {profile?.pincode || 'Not set'}</p>
        {!profile?.pincode && (
          <p className="blood-request-page__hint">
            Update your <Link to={ROUTES.HOSPITAL_PROFILE}>hospital profile</Link> before sending a request.
          </p>
        )}
      </div>

      {success && (
        <div className="blood-request-page__success" role="status">
          Request sent to {success.count} nearby donor(s).
          {success.requestGroupId && (
            <span> Group ID: {success.requestGroupId.slice(0, 8)}…</span>
          )}
          {' '}
          <Link to={ROUTES.HOSPITAL_REQUESTS}>View sent requests</Link>
        </div>
      )}

      {error && <p className="blood-request-page__error">{error}</p>}

      <form className="blood-request-page__form" onSubmit={handleSendRequest}>
        <label className="blood-request-page__field">
          Contact person name
          <input
            type="text"
            name="contactPersonName"
            value={form.contactPersonName}
            onChange={handleChange}
            required
          />
        </label>

        <label className="blood-request-page__field">
          Contact phone
          <input
            type="tel"
            name="contactPhoneNumber"
            value={form.contactPhoneNumber}
            onChange={handleChange}
            required
          />
        </label>

        <label className="blood-request-page__field">
          Emergency level
          <select name="emergencyLevel" value={form.emergencyLevel} onChange={handleChange}>
            {EMERGENCY_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>
        </label>

        <label className="blood-request-page__field">
          Required before
          <input
            type="datetime-local"
            name="requiredBeforeDateTime"
            value={form.requiredBeforeDateTime}
            onChange={handleChange}
            required
          />
        </label>

        <label className="blood-request-page__field">
          Reason (optional)
          <textarea
            name="reasonForBloodRequirement"
            value={form.reasonForBloodRequirement}
            onChange={handleChange}
            rows={3}
            maxLength={1000}
          />
        </label>

        <button type="submit" className="blood-request-page__submit" disabled={submitLoading || !patientId}>
          {submitLoading ? 'Sending…' : 'Broadcast request to nearby donors'}
        </button>
      </form>
    </div>
  );
}

export default HospitalSendRequestPage;
