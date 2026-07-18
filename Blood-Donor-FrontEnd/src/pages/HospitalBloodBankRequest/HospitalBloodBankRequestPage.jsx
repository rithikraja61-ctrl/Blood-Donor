import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import CommonInput from '../../components/auth/CommonInput';
import { getHospitalProfile, listBloodBanksForHospital, sendBloodBankRequest } from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import { BLOOD_GROUPS, EMERGENCY_LEVELS } from '../../utils/constants';
import '../BloodRequest/BloodRequestPage.css';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

function defaultRequiredBefore() {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatRequiredBefore(value) {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
}

function buildInitialForm(profile) {
  return {
    bloodBankId: '',
    patientName: '',
    patientAge: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    requiredUnits: '1',
    emergencyLevel: 'NORMAL',
    reason: '',
    requiredBefore: defaultRequiredBefore(),
    hospitalContact: profile?.phoneNumber || '',
  };
}

function HospitalBloodBankRequestPage() {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [form, setForm] = useState(buildInitialForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadInitial = useCallback(async () => {
    try {
      const [banks, profile] = await Promise.all([
        listBloodBanksForHospital(),
        getHospitalProfile(),
      ]);
      setBloodBanks(banks);
      setForm((prev) => ({
        ...buildInitialForm(profile),
        bloodBankId: banks[0]?.id ? String(banks[0].id) : prev.bloodBankId,
        patientName: prev.patientName,
        patientAge: prev.patientAge,
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load blood banks.');
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'hospitalContact') {
      next = value.replace(/\D/g, '').slice(0, 15);
    }
    setForm((prev) => ({ ...prev, [name]: next }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.bloodBankId) {
      nextErrors.bloodBankId = 'Select a blood bank.';
    }
    if (!form.patientName.trim()) {
      nextErrors.patientName = 'Patient name is required.';
    }
    if (!form.patientAge || Number(form.patientAge) < 0) {
      nextErrors.patientAge = 'Enter a valid patient age.';
    }
    if (!form.requiredUnits || Number(form.requiredUnits) < 1) {
      nextErrors.requiredUnits = 'Required units must be at least 1.';
    }
    if (!form.reason.trim()) {
      nextErrors.reason = 'Reason is required.';
    }
    if (!form.requiredBefore) {
      nextErrors.requiredBefore = 'Required before date and time is required.';
    } else if (new Date(form.requiredBefore) <= new Date()) {
      nextErrors.requiredBefore = 'Required before must be in the future.';
    }
    if (!/^[0-9]{10,15}$/.test(form.hospitalContact)) {
      nextErrors.hospitalContact = 'Enter a valid phone number (10–15 digits).';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) {
      setError('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await sendBloodBankRequest({
        bloodBankId: Number(form.bloodBankId),
        patientName: form.patientName.trim(),
        patientAge: Number(form.patientAge),
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        requiredUnits: Number(form.requiredUnits),
        emergencyLevel: form.emergencyLevel,
        reason: form.reason.trim(),
        requiredBefore: formatRequiredBefore(form.requiredBefore),
        hospitalContact: form.hospitalContact,
      });
      setSuccess(`Request #${response.requestId} sent to blood bank successfully.`);
      setForm((prev) => ({
        ...buildInitialForm({ phoneNumber: prev.hospitalContact }),
        bloodBankId: prev.bloodBankId,
      }));
      setFieldErrors({});
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
        const details = Object.values(err.fieldErrors).join(' ');
        setError(details || err.message);
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to send request.');
      }
    } finally {
      setLoading(false);
    }
  };

  const bloodBankOptions = bloodBanks.map((bank) => ({
    value: String(bank.id),
    label: `${bank.name} — ${bank.city || 'City'} (${bank.pinCode || 'pincode'})`,
  }));

  return (
    <div className="blood-request-page">
      <PageHeader
        title="Request blood from bank"
        subtitle="Send a stock request to a registered blood bank."
      />

      {error && <p className="blood-request-page__error">{error}</p>}
      {success && <p className="blood-request-page__success">{success}</p>}

      {bloodBanks.length === 0 && !error && (
        <p className="blood-request-page__hint">No blood banks registered yet. Ask your coordinator to register one first.</p>
      )}

      <form className="blood-request-page__form" onSubmit={handleSubmit}>
        <CommonInput
          id="bloodBankId"
          label="Blood bank"
          name="bloodBankId"
          type="select"
          value={form.bloodBankId}
          onChange={handleChange}
          error={fieldErrors.bloodBankId}
          options={bloodBankOptions.length > 0
            ? bloodBankOptions
            : [{ value: '', label: 'No blood banks available' }]}
        />
        <CommonInput
          id="patientName"
          label="Patient name"
          name="patientName"
          value={form.patientName}
          onChange={handleChange}
          error={fieldErrors.patientName}
        />
        <CommonInput
          id="patientAge"
          label="Patient age"
          name="patientAge"
          type="number"
          value={form.patientAge}
          onChange={handleChange}
          error={fieldErrors.patientAge}
        />
        <CommonInput id="gender" label="Gender" name="gender" type="select" value={form.gender} onChange={handleChange} options={GENDERS} />
        <CommonInput id="bloodGroup" label="Blood group" name="bloodGroup" type="select" value={form.bloodGroup} onChange={handleChange} options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))} />
        <CommonInput
          id="requiredUnits"
          label="Required units"
          name="requiredUnits"
          type="number"
          value={form.requiredUnits}
          onChange={handleChange}
          error={fieldErrors.requiredUnits}
        />
        <CommonInput id="emergencyLevel" label="Emergency level" name="emergencyLevel" type="select" value={form.emergencyLevel} onChange={handleChange} options={EMERGENCY_LEVELS} />
        <CommonInput
          id="reason"
          label="Reason"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          error={fieldErrors.reason}
          placeholder="Why is blood needed?"
        />
        <CommonInput
          id="requiredBefore"
          label="Required before"
          name="requiredBefore"
          type="datetime-local"
          value={form.requiredBefore}
          onChange={handleChange}
          error={fieldErrors.requiredBefore}
        />
        <CommonInput
          id="hospitalContact"
          label="Hospital contact phone"
          name="hospitalContact"
          value={form.hospitalContact}
          onChange={handleChange}
          error={fieldErrors.hospitalContact}
          placeholder="10–15 digit phone number"
        />
        <button type="submit" className="auth-form__submit" disabled={loading || bloodBanks.length === 0}>
          {loading ? 'Sending…' : 'Send to blood bank'}
        </button>
      </form>
    </div>
  );
}

export default HospitalBloodBankRequestPage;
