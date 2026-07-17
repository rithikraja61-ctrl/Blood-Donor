import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import { sendUserBloodRequest } from '../../services/bloodRequestService';
import { ApiError } from '../../services/apiClient';
import { EMERGENCY_LEVELS, ROUTES } from '../../utils/constants';
import './BloodRequestPage.css';

const INITIAL = {
  contactPersonName: '',
  contactPhoneNumber: '',
  emergencyLevel: 'NORMAL',
  requiredBeforeDateTime: '',
  reasonForBloodRequirement: '',
  unitsOfBloodRequired: 1,
};

function BloodRequestPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;

    if (name === 'contactPhoneNumber') {
      next = value.replace(/\D/g, '').slice(0, 15);
    } else if (name === 'unitsOfBloodRequired') {
      next = Math.max(1, Number(value) || 1);
    }

    setForm((prev) => ({ ...prev, [name]: next }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!user?.bloodGroup) {
      setError('Please set your blood group in your profile before requesting blood.');
      return;
    }

    if (!/^[0-9]{6}$/.test(user?.pincode || '')) {
      setError('Please set a valid 6-digit pincode in your profile before requesting blood.');
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

    setLoading(true);

    try {
      const responses = await sendUserBloodRequest({
        contactPersonName: form.contactPersonName.trim(),
        contactPhoneNumber: form.contactPhoneNumber,
        emergencyLevel: form.emergencyLevel,
        requiredBeforeDateTime: form.requiredBeforeDateTime,
        reasonForBloodRequirement: form.reasonForBloodRequirement.trim() || undefined,
        unitsOfBloodRequired: form.unitsOfBloodRequired,
      });

      setSuccess({
        count: responses.length,
        requestGroupId: responses[0]?.requestGroupId,
      });
      setForm(INITIAL);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to send blood request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blood-request-page">
      <PageHeader
        title="Request Blood"
        subtitle="Your request is broadcast automatically to eligible donors in your pincode and nearby areas."
      />

      <div className="blood-request-page__profile">
        <p><strong>Blood group:</strong> {user?.bloodGroup || 'Not set'}</p>
        <p><strong>Pincode:</strong> {user?.pincode || 'Not set'}</p>
        {(!user?.bloodGroup || !user?.pincode) && (
          <p className="blood-request-page__hint">
            Update your <Link to={ROUTES.PROFILE}>profile</Link> before sending a request.
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
          <Link to={ROUTES.MY_REQUESTS}>View my requests</Link>
        </div>
      )}

      {error && <p className="blood-request-page__error">{error}</p>}

      <form className="blood-request-page__form" onSubmit={handleSubmit}>
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
          Units required
          <input
            type="number"
            name="unitsOfBloodRequired"
            min={1}
            value={form.unitsOfBloodRequired}
            onChange={handleChange}
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
    </div>
  );
}

export default BloodRequestPage;
