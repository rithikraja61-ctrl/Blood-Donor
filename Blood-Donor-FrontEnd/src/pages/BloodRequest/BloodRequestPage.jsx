import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import DonorPickerSection from '../../components/donor/DonorPickerSection';
import GpsCaptureButton from '../../components/map/GpsCaptureButton';
import {
  listUserBloodBanks,
  sendUserBloodBankRequest,
  sendUserBloodRequest,
} from '../../services/bloodRequestService';
import { updateUserLiveLocation } from '../../services/liveLocationService';
import { ApiError } from '../../services/apiClient';
import { EMERGENCY_LEVELS, ROUTES } from '../../utils/constants';
import '../HospitalSendRequest/HospitalSendRequestPage.css';
import '../../styles/find-donor.css';
import './BloodRequestPage.css';

const INITIAL = {
  contactPersonName: '',
  contactPhoneNumber: '',
  emergencyLevel: 'NORMAL',
  requiredBeforeDateTime: '',
  reasonForBloodRequirement: '',
};

const BANK_INITIAL = {
  bloodBankId: '',
  emergencyLevel: 'NORMAL',
  requiredBefore: '',
  requiredUnits: '1',
  reason: '',
};

function BloodRequestPage() {
  const { user } = useAuth();
  const [requestTab, setRequestTab] = useState('donors');
  const [form, setForm] = useState(INITIAL);
  const [bankForm, setBankForm] = useState(BANK_INITIAL);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [liveLocation, setLiveLocation] = useState(null);
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      contactPersonName: prev.contactPersonName || user?.name || '',
      contactPhoneNumber: prev.contactPhoneNumber || user?.phoneNumber || '',
    }));
  }, [user?.name, user?.phoneNumber]);

  const loadBloodBanks = useCallback(async () => {
    try {
      setBloodBanks(await listUserBloodBanks());
    } catch {
      setBloodBanks([]);
    }
  }, []);

  useEffect(() => {
    if (requestTab === 'bloodbank') {
      loadBloodBanks();
    }
  }, [requestTab, loadBloodBanks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'contactPhoneNumber') {
      next = value.replace(/\D/g, '').slice(0, 15);
    }
    setForm((prev) => ({ ...prev, [name]: next }));
    setError('');
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateDonorRequest = () => {
    if (!user?.bloodGroup) {
      return 'Please set your blood group in your profile before requesting blood.';
    }
    if (!/^[0-9]{6}$/.test(user?.pincode || '')) {
      return 'Please set a valid 6-digit pincode in your profile before requesting blood.';
    }
    if (!liveLocation?.latitude || !liveLocation?.longitude) {
      return 'Please capture your live GPS location before sending the request.';
    }
    if (!form.contactPersonName.trim()) {
      return 'Contact person name is required.';
    }
    if (!/^[0-9]{10,15}$/.test(form.contactPhoneNumber)) {
      return 'Enter a valid contact phone number (10–15 digits).';
    }
    if (!form.requiredBeforeDateTime) {
      return 'Required-by date and time is required.';
    }
    return '';
  };

  const sendToDonors = async (mode) => {
    setError('');
    setSuccess(null);
    const validationError = validateDonorRequest();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (mode === 'selected' && selectedDonorIds.length === 0) {
      setError('Select at least one donor from search results.');
      return;
    }

    setLoading(true);
    try {
      await updateUserLiveLocation(liveLocation.latitude, liveLocation.longitude);
      const responses = await sendUserBloodRequest({
        contactPersonName: form.contactPersonName.trim(),
        contactPhoneNumber: form.contactPhoneNumber,
        emergencyLevel: form.emergencyLevel,
        requiredBeforeDateTime: form.requiredBeforeDateTime,
        reasonForBloodRequirement: form.reasonForBloodRequirement.trim() || undefined,
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        radiusKm: 25,
        ...(mode === 'selected' ? { donorIds: selectedDonorIds } : {}),
      });
      setSuccess({
        type: 'donors',
        count: responses.length,
        requestGroupId: responses[0]?.requestGroupId,
      });
      setForm(INITIAL);
      setSelectedDonorIds([]);
      setLiveLocation(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send blood request.');
    } finally {
      setLoading(false);
    }
  };

  const sendToBloodBank = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!user?.bloodGroup) {
      setError('Set your blood group in profile before requesting from a blood bank.');
      return;
    }
    if (!bankForm.bloodBankId) {
      setError('Select a blood bank.');
      return;
    }
    if (!bankForm.requiredBefore) {
      setError('Required-by date and time is required.');
      return;
    }
    if (!form.contactPersonName.trim() || !/^[0-9]{10,15}$/.test(form.contactPhoneNumber)) {
      setError('Fill contact name and phone in the donor tab fields first.');
      return;
    }

    setLoading(true);
    try {
      const response = await sendUserBloodBankRequest({
        bloodBankId: Number(bankForm.bloodBankId),
        emergencyLevel: bankForm.emergencyLevel,
        requiredBefore: bankForm.requiredBefore,
        requiredUnits: Number(bankForm.requiredUnits) || 1,
        contactPersonName: form.contactPersonName.trim(),
        contactPhoneNumber: form.contactPhoneNumber,
        reason: bankForm.reason.trim() || undefined,
      });
      setSuccess({ type: 'bloodbank', requestId: response.requestId });
      setBankForm(BANK_INITIAL);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send blood bank request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blood-request-page find-donor-page">
      <PageHeader
        title="Request Blood"
        subtitle="Pick specific donors, broadcast nearby, or request units from a blood bank."
      />

      <div className="hospital-send-request__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`hospital-send-request__tab ${requestTab === 'donors' ? 'hospital-send-request__tab--active' : ''}`}
          onClick={() => {
            setRequestTab('donors');
            setError('');
            setSuccess(null);
          }}
        >
          Send to donors
        </button>
        <button
          type="button"
          role="tab"
          className={`hospital-send-request__tab ${requestTab === 'bloodbank' ? 'hospital-send-request__tab--active' : ''}`}
          onClick={() => {
            setRequestTab('bloodbank');
            setError('');
            setSuccess(null);
          }}
        >
          Send to blood bank
        </button>
      </div>

      <GpsCaptureButton
        required={requestTab === 'donors'}
        onCapture={setLiveLocation}
        label="Update live location with GPS"
        capturedLabel="Live location ready"
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

      {success?.type === 'donors' && (
        <div className="blood-request-page__success" role="status">
          Request sent to {success.count} donor(s).
          {success.requestGroupId && (
            <span> Group ID: {success.requestGroupId.slice(0, 8)}…</span>
          )}
          {' '}
          <Link to={ROUTES.MY_REQUESTS}>View my requests</Link>
        </div>
      )}

      {success?.type === 'bloodbank' && (
        <div className="blood-request-page__success" role="status">
          Blood bank request #{success.requestId} submitted successfully.
        </div>
      )}

      {error && <p className="blood-request-page__error">{error}</p>}

      {requestTab === 'donors' && (
        <>
          <DonorPickerSection
            bloodGroup={user?.bloodGroup}
            pincode={user?.pincode}
            liveLocation={liveLocation}
            selectedDonorIds={selectedDonorIds}
            onSelectionChange={setSelectedDonorIds}
            disabled={loading}
          />

          <form className="blood-request-page__form" onSubmit={(e) => e.preventDefault()}>
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
              <input type="datetime-local" name="requiredBeforeDateTime" value={form.requiredBeforeDateTime} onChange={handleChange} required />
            </label>
            <label className="blood-request-page__field">
              Reason (optional)
              <textarea name="reasonForBloodRequirement" value={form.reasonForBloodRequirement} onChange={handleChange} rows={3} maxLength={1000} />
            </label>
            <div className="hospital-send-request__send-actions">
              <button
                type="button"
                className="find-donor-page__btn find-donor-page__btn--secondary"
                disabled={loading || selectedDonorIds.length === 0}
                onClick={() => sendToDonors('selected')}
              >
                {loading ? 'Sending…' : `Send to selected (${selectedDonorIds.length})`}
              </button>
              <button
                type="button"
                className="blood-request-page__submit"
                disabled={loading}
                onClick={() => sendToDonors('all')}
              >
                {loading ? 'Sending…' : 'Broadcast to all nearby donors'}
              </button>
            </div>
          </form>
        </>
      )}

      {requestTab === 'bloodbank' && (
        <form className="blood-request-page__form" onSubmit={sendToBloodBank}>
          <label className="blood-request-page__field">
            Contact person name
            <input type="text" name="contactPersonName" value={form.contactPersonName} onChange={handleChange} required />
          </label>
          <label className="blood-request-page__field">
            Contact phone
            <input type="tel" name="contactPhoneNumber" value={form.contactPhoneNumber} onChange={handleChange} required />
          </label>
          <label className="blood-request-page__field">
            Blood bank
            <select name="bloodBankId" value={bankForm.bloodBankId} onChange={handleBankChange} required>
              <option value="">Select blood bank</option>
              {bloodBanks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bloodBankName}
                  {bank.city ? ` — ${bank.city}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="blood-request-page__field">
            Units required
            <input type="number" name="requiredUnits" min="1" value={bankForm.requiredUnits} onChange={handleBankChange} />
          </label>
          <label className="blood-request-page__field">
            Emergency level
            <select name="emergencyLevel" value={bankForm.emergencyLevel} onChange={handleBankChange}>
              {EMERGENCY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </label>
          <label className="blood-request-page__field">
            Required before
            <input type="datetime-local" name="requiredBefore" value={bankForm.requiredBefore} onChange={handleBankChange} required />
          </label>
          <label className="blood-request-page__field">
            Reason (optional)
            <textarea name="reason" value={bankForm.reason} onChange={handleBankChange} rows={3} maxLength={1000} />
          </label>
          <button type="submit" className="blood-request-page__submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send to blood bank'}
          </button>
        </form>
      )}
    </div>
  );
}

export default BloodRequestPage;
