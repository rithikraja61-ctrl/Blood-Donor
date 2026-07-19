import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { EMERGENCY_LEVELS, ROUTES } from '../../utils/constants';
import {
  getHospitalProfile,
  listBloodBanks,
  listPatients,
  sendBloodBankRequest,
} from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import '../BloodRequest/BloodRequestPage.css';
import '../HospitalSendRequest/HospitalSendRequestPage.css';

const INITIAL = {
  bloodBankId: '',
  emergencyLevel: 'NORMAL',
  requiredBefore: '',
  hospitalContact: '',
  reason: '',
};

function toDateTimeLocalValue(dateString) {
  if (!dateString) return '';
  return dateString.length === 10 ? `${dateString}T12:00` : dateString;
}

function HospitalBloodBankRequestPage() {
  const location = useLocation();
  const preselectedPatientId = location.state?.patientId;

  const [patients, setPatients] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.id) === String(patientId)),
    [patients, patientId],
  );

  const loadInitial = useCallback(async () => {
    setPageLoading(true);
    setError('');
    try {
      const [patientList, bankList, hospitalProfile] = await Promise.all([
        listPatients(),
        listBloodBanks(),
        getHospitalProfile(),
      ]);
      setPatients(patientList);
      setBloodBanks(bankList);
      if (preselectedPatientId) {
        setPatientId(String(preselectedPatientId));
      }
      setForm((prev) => ({
        ...prev,
        hospitalContact: hospitalProfile?.phoneNumber || '',
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data.');
    } finally {
      setPageLoading(false);
    }
  }, [preselectedPatientId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!selectedPatient) return;
    setForm((prev) => ({
      ...prev,
      reason: selectedPatient.reasonForBlood || '',
      requiredBefore: toDateTimeLocalValue(selectedPatient.requiredBeforeDate) || prev.requiredBefore,
    }));
  }, [selectedPatient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'hospitalContact') {
      next = value.replace(/\D/g, '').slice(0, 15);
    }
    setForm((prev) => ({ ...prev, [name]: next }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!patientId) {
      setError('Select a patient.');
      return;
    }
    if (!form.bloodBankId) {
      setError('Select a blood bank.');
      return;
    }
    if (!/^[0-9]{10,15}$/.test(form.hospitalContact)) {
      setError('Enter a valid hospital contact phone (10–15 digits).');
      return;
    }
    if (!form.requiredBefore) {
      setError('Required-by date and time is required.');
      return;
    }
    const requiredBeforeMs = new Date(form.requiredBefore).getTime();
    if (Number.isNaN(requiredBeforeMs) || requiredBeforeMs <= Date.now()) {
      setError('Required-by date and time must be in the future.');
      return;
    }

    setLoading(true);
    try {
      const response = await sendBloodBankRequest({
        bloodBankId: Number(form.bloodBankId),
        patientId: Number(patientId),
        emergencyLevel: form.emergencyLevel,
        requiredBefore: form.requiredBefore,
        hospitalContact: form.hospitalContact,
        reason: form.reason.trim() || undefined,
      });
      setSuccess(`Request #${response.requestId} sent to blood bank successfully.`);
      setForm((prev) => ({
        ...INITIAL,
        hospitalContact: prev.hospitalContact,
      }));
      setPatientId('');
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const detail = Object.values(err.fieldErrors).join(' ');
        setError(detail || err.message);
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to send request.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="blood-request-page">
        <PageHeader title="Request blood from bank" subtitle="Loading…" />
        <p className="blood-request-page__loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="blood-request-page hospital-send-request">
      <PageHeader
        title="Request blood from bank"
        subtitle="Select a patient and blood bank — patient details are filled automatically."
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
            {selectedPatient.patientName}, age {selectedPatient.age}, {selectedPatient.gender}
            {' — '}
            {selectedPatient.bloodGroup}, {selectedPatient.unitsRequired || 1} unit(s)
          </p>
        )}
      </section>

      <section className="hospital-send-request__patient">
        <label htmlFor="bloodBankSelect">Blood bank</label>
        <select
          id="bloodBankSelect"
          name="bloodBankId"
          value={form.bloodBankId}
          onChange={handleChange}
        >
          <option value="">Select blood bank</option>
          {bloodBanks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.bloodBankName}
              {bank.city ? ` — ${bank.city}` : ''}
              {bank.pinCode ? ` (${bank.pinCode})` : ''}
            </option>
          ))}
        </select>
      </section>

      {error && <p className="blood-request-page__error">{error}</p>}
      {success && <p className="blood-request-page__success">{success}</p>}

      {bloodBanks.length === 0 && !error && (
        <p className="blood-request-page__hint">
          No blood banks registered yet. Ask your coordinator to register one first.
        </p>
      )}

      <form className="blood-request-page__form" onSubmit={handleSubmit}>
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
            name="requiredBefore"
            value={form.requiredBefore}
            onChange={handleChange}
            required
          />
        </label>

        <label className="blood-request-page__field">
          Reason (optional)
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            rows={3}
            maxLength={1000}
          />
        </label>

        <label className="blood-request-page__field">
          Hospital contact phone
          <input
            type="tel"
            name="hospitalContact"
            value={form.hospitalContact}
            onChange={handleChange}
            required
          />
        </label>

        <button
          type="submit"
          className="blood-request-page__submit"
          disabled={loading || !patientId || !form.bloodBankId}
        >
          {loading ? 'Sending…' : 'Send to blood bank'}
        </button>
      </form>

      <p className="blood-request-page__hint">
        Manage patients in <Link to={ROUTES.HOSPITAL_PATIENTS}>Patients</Link>.
      </p>
    </div>
  );
}

export default HospitalBloodBankRequestPage;
