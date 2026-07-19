import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import {
  getBloodBankProfile,
  listSentBloodBankBloodRequests,
  sendBloodBankBloodRequest,
} from '../../services/bloodBankService';
import GpsCaptureButton from '../../components/map/GpsCaptureButton';
import { ApiError } from '../../services/apiClient';
import {
  BLOOD_GROUPS,
  BLOOD_GROUP_TO_TYPE,
  BLOOD_REQUEST_STATUS_LABELS,
  EMERGENCY_LEVELS,
  ROUTES,
} from '../../utils/constants';
import '../BloodRequest/BloodRequestPage.css';
import './BloodBankSendRequestPage.css';

const INITIAL = {
  patientName: '',
  bloodGroup: 'O+',
  contactPersonName: '',
  contactPhoneNumber: '',
  emergencyLevel: 'NORMAL',
  requiredBeforeDateTime: '',
  reasonForBloodRequirement: '',
};

function BloodBankSendRequestPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [profile, setProfile] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);

  const loadSent = useCallback(async () => {
    setListLoading(true);
    try {
      setSentRequests(await listSentBloodBankBloodRequests());
    } catch {
      setSentRequests([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await getBloodBankProfile();
        setProfile(p);
        setForm((prev) => ({
          ...prev,
          contactPersonName: p?.bloodBankName || user?.name || '',
          contactPhoneNumber: p?.phoneNumber || '',
        }));
      } catch {
        // profile optional for display hints
      }
    })();
    loadSent();
  }, [loadSent, user?.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'contactPhoneNumber') {
      next = value.replace(/\D/g, '').slice(0, 15);
    }
    setForm((prev) => ({ ...prev, [name]: next }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!form.patientName.trim()) {
      setError('Patient or recipient name is required.');
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
    if (!/^[0-9]{6}$/.test(profile?.pinCode || user?.pincode || '')) {
      setError('Set a valid 6-digit pincode in your profile before sending a request.');
      return;
    }
    if (!liveLocation?.latitude || !liveLocation?.longitude) {
      setError('Please capture your blood bank live GPS location before sending.');
      return;
    }

    setLoading(true);
    try {
      const responses = await sendBloodBankBloodRequest({
        patientName: form.patientName.trim(),
        bloodType: BLOOD_GROUP_TO_TYPE[form.bloodGroup],
        contactPersonName: form.contactPersonName.trim(),
        contactPhoneNumber: form.contactPhoneNumber,
        emergencyLevel: form.emergencyLevel,
        requiredBeforeDateTime: form.requiredBeforeDateTime,
        reasonForBloodRequirement: form.reasonForBloodRequirement.trim() || undefined,
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
      });
      setSuccess({ count: responses.length, requestGroupId: responses[0]?.requestGroupId });
      setForm((prev) => ({
        ...INITIAL,
        bloodGroup: prev.bloodGroup,
        contactPersonName: prev.contactPersonName,
        contactPhoneNumber: prev.contactPhoneNumber,
      }));
      await loadSent();
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldMsg = err.fieldErrors
          ? Object.values(err.fieldErrors).find(Boolean)
          : null;
        const message = fieldMsg || err.message;
        setError(
          message === 'No eligible donors found nearby'
            ? 'No eligible donors found nearby for this blood group. Try a compatible group (e.g. A+ if O+ donors are unavailable) or add donors in this area.'
            : message,
        );
      } else {
        setError('Failed to send request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blood-request-page blood-bank-send-request">
      <PageHeader
        title="Send request"
        subtitle="Capture live GPS location and broadcast to eligible donors nearby."
      />

      <GpsCaptureButton
        required
        onCapture={setLiveLocation}
        label="Update blood bank live location (GPS)"
        capturedLabel="Blood bank live location ready"
      />

      <div className="blood-request-page__profile">
        <p><strong>Pincode:</strong> {profile?.pinCode || user?.pincode || 'Not set'}</p>
        {(!profile?.pinCode && !user?.pincode) && (
          <p className="blood-request-page__hint">
            Update your <Link to={ROUTES.BLOOD_BANK_PROFILE}>profile</Link> before sending a request.
          </p>
        )}
      </div>

      {success && (
        <div className="blood-request-page__success" role="status">
          Request sent to {success.count} nearby donor(s).
          {success.requestGroupId && (
            <span> Group ID: {success.requestGroupId.slice(0, 8)}…</span>
          )}
        </div>
      )}

      {error && <p className="blood-request-page__error">{error}</p>}

      <form className="blood-request-page__form" onSubmit={handleSubmit}>
        <label className="blood-request-page__field">
          Patient / recipient name
          <input type="text" name="patientName" value={form.patientName} onChange={handleChange} required />
        </label>

        <label className="blood-request-page__field">
          Blood group
          <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </label>

        <label className="blood-request-page__field">
          Contact person name
          <input type="text" name="contactPersonName" value={form.contactPersonName} onChange={handleChange} required />
        </label>

        <label className="blood-request-page__field">
          Contact phone
          <input type="tel" name="contactPhoneNumber" value={form.contactPhoneNumber} onChange={handleChange} required />
        </label>

        <label className="blood-request-page__field">
          Emergency level
          <select name="emergencyLevel" value={form.emergencyLevel} onChange={handleChange}>
            {EMERGENCY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
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

        <button type="submit" className="blood-request-page__submit" disabled={loading}>
          {loading ? 'Sending…' : 'Broadcast request to nearby donors'}
        </button>
      </form>

      <section className="blood-bank-send-request__sent" aria-label="Sent requests">
        <h2>Your sent requests</h2>
        {listLoading ? (
          <p>Loading sent requests…</p>
        ) : sentRequests.length === 0 ? (
          <p>No requests sent yet.</p>
        ) : (
          <ul className="blood-bank-send-request__list">
            {sentRequests.map((req) => (
              <li key={req.id} className="blood-bank-send-request__item">
                <strong>{req.patientName}</strong> · {req.requiredBloodGroupDisplay}
                {' · '}
                <span>{BLOOD_REQUEST_STATUS_LABELS[req.status] || req.status}</span>
                {' · '}
                Donor: {req.donorName || '—'}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default BloodBankSendRequestPage;
