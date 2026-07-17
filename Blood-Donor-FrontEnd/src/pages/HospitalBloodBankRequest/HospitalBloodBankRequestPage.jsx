import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import CommonInput from '../../components/auth/CommonInput';
import { sendBloodBankRequest } from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import { BLOOD_GROUPS, EMERGENCY_LEVELS } from '../../utils/constants';
import '../BloodRequest/BloodRequestPage.css';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const INITIAL = {
  bloodBankId: '',
  patientName: '',
  patientAge: '',
  gender: 'MALE',
  bloodGroup: 'O+',
  requiredUnits: '1',
  emergencyLevel: 'NORMAL',
  reason: '',
  requiredBefore: '',
  hospitalContact: '',
};

function HospitalBloodBankRequestPage() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        requiredBefore: form.requiredBefore.length === 16
          ? `${form.requiredBefore}:00`
          : form.requiredBefore,
        hospitalContact: form.hospitalContact,
      });
      setSuccess(`Request #${response.requestId} sent to blood bank successfully.`);
      setForm(INITIAL);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blood-request-page">
      <PageHeader
        title="Request blood from bank"
        subtitle="Send a stock request to a registered blood bank (use blood bank ID from your coordinator)."
      />

      {error && <p className="blood-request-page__error">{error}</p>}
      {success && <p className="blood-request-page__success">{success}</p>}

      <form className="blood-request-page__form" onSubmit={handleSubmit}>
        <CommonInput
          id="bloodBankId"
          label="Blood bank ID"
          name="bloodBankId"
          type="number"
          value={form.bloodBankId}
          onChange={handleChange}
          placeholder="e.g. 1"
        />
        <CommonInput id="patientName" label="Patient name" name="patientName" value={form.patientName} onChange={handleChange} />
        <CommonInput id="patientAge" label="Patient age" name="patientAge" type="number" value={form.patientAge} onChange={handleChange} />
        <CommonInput id="gender" label="Gender" name="gender" type="select" value={form.gender} onChange={handleChange} options={GENDERS} />
        <CommonInput id="bloodGroup" label="Blood group" name="bloodGroup" type="select" value={form.bloodGroup} onChange={handleChange} options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))} />
        <CommonInput id="requiredUnits" label="Required units" name="requiredUnits" type="number" value={form.requiredUnits} onChange={handleChange} />
        <CommonInput id="emergencyLevel" label="Emergency level" name="emergencyLevel" type="select" value={form.emergencyLevel} onChange={handleChange} options={EMERGENCY_LEVELS} />
        <CommonInput id="reason" label="Reason" name="reason" value={form.reason} onChange={handleChange} />
        <CommonInput id="requiredBefore" label="Required before" name="requiredBefore" type="datetime-local" value={form.requiredBefore} onChange={handleChange} />
        <CommonInput id="hospitalContact" label="Hospital contact phone" name="hospitalContact" value={form.hospitalContact} onChange={handleChange} />
        <button type="submit" className="auth-form__submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send to blood bank'}
        </button>
      </form>
    </div>
  );
}

export default HospitalBloodBankRequestPage;
