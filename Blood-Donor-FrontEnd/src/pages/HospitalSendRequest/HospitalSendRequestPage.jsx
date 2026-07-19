import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DonorPickerSection from '../../components/donor/DonorPickerSection';
import GpsCaptureButton from '../../components/map/GpsCaptureButton';
import { EMERGENCY_LEVELS, ROUTES } from '../../utils/constants';
import {
  getHospitalProfile,
  listBloodBanks,
  listPatients,
  sendBloodBankRequest,
  sendHospitalBloodRequest,
} from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import '../BloodRequest/BloodRequestPage.css';
import '../../styles/find-donor.css';
import './HospitalSendRequestPage.css';

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
  hospitalContact: '',
  reason: '',
};

function toDateTimeLocalValue(dateString) {
  if (!dateString) return '';
  return dateString.length === 10 ? `${dateString}T12:00` : dateString;
}

function HospitalSendRequestPage() {
  const location = useLocation();
  const preselectedPatientId = location.state?.patientId;
  const initialTab = location.state?.tab === 'bloodbank' ? 'bloodbank' : 'donors';

  const [requestTab, setRequestTab] = useState(initialTab);
  const [patients, setPatients] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [form, setForm] = useState(INITIAL);
  const [bankForm, setBankForm] = useState(BANK_INITIAL);
  const [liveLocation, setLiveLocation] = useState(null);
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.id) === String(patientId)),
    [patients, patientId],
  );

  const loadInitial = useCallback(async () => {
    try {
      const [patientList, bankList, hospitalProfile] = await Promise.all([
        listPatients(),
        listBloodBanks(),
        getHospitalProfile(),
      ]);
      setPatients(patientList);
      setBloodBanks(bankList);
      setProfile(hospitalProfile);
      if (preselectedPatientId) {
        setPatientId(String(preselectedPatientId));
      }
      const contact = hospitalProfile?.phoneNumber || '';
      setForm((prev) => ({
        ...prev,
        contactPersonName: hospitalProfile?.name || '',
        contactPhoneNumber: contact,
      }));
      setBankForm((prev) => ({ ...prev, hospitalContact: contact }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data.');
    }
  }, [preselectedPatientId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!selectedPatient) return;
    setForm((prev) => ({
      ...prev,
      reasonForBloodRequirement: selectedPatient.reasonForBlood || prev.reasonForBloodRequirement,
    }));
    setBankForm((prev) => ({
      ...prev,
      reason: selectedPatient.reasonForBlood || prev.reason,
      requiredBefore: toDateTimeLocalValue(selectedPatient.requiredBeforeDate) || prev.requiredBefore,
    }));
  }, [selectedPatient]);

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
    let next = value;
    if (name === 'hospitalContact') {
      next = value.replace(/\D/g, '').slice(0, 15);
    }
    setBankForm((prev) => ({ ...prev, [name]: next }));
    setError('');
  };

  const validateCommon = () => {
    if (!patientId) return 'Select a patient.';
    if (!liveLocation?.latitude || !liveLocation?.longitude) {
      return 'Capture hospital live GPS location before sending.';
    }
    if (!/^[0-9]{6}$/.test(profile?.pincode || '')) {
      return 'Set a valid 6-digit pincode in your hospital profile.';
    }
    return '';
  };

  const sendToDonors = async (mode) => {
    setError('');
    setSuccess(null);
    const commonError = validateCommon();
    if (commonError) {
      setError(commonError);
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
    if (mode === 'selected' && selectedDonorIds.length === 0) {
      setError('Select at least one donor from search results.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        patientId: Number(patientId),
        contactPersonName: form.contactPersonName.trim(),
        contactPhoneNumber: form.contactPhoneNumber,
        emergencyLevel: form.emergencyLevel,
        requiredBeforeDateTime: form.requiredBeforeDateTime,
        reasonForBloodRequirement: form.reasonForBloodRequirement.trim() || undefined,
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        radiusKm: 25,
        ...(mode === 'selected' ? { donorIds: selectedDonorIds } : {}),
      };
      const responses = await sendHospitalBloodRequest(payload);
      setSuccess({
        type: 'donors',
        count: responses.length,
        requestGroupId: responses[0]?.requestGroupId,
      });
      setSelectedDonorIds([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const sendToBloodBank = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    if (!patientId) {
      setError('Select a patient.');
      return;
    }
    if (!bankForm.bloodBankId) {
      setError('Select a blood bank.');
      return;
    }
    if (!/^[0-9]{10,15}$/.test(bankForm.hospitalContact)) {
      setError('Enter a valid hospital contact phone (10–15 digits).');
      return;
    }
    if (!bankForm.requiredBefore) {
      setError('Required-by date and time is required.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await sendBloodBankRequest({
        bloodBankId: Number(bankForm.bloodBankId),
        patientId: Number(patientId),
        emergencyLevel: bankForm.emergencyLevel,
        requiredBefore: bankForm.requiredBefore.length === 16
          ? `${bankForm.requiredBefore}:00`
          : bankForm.requiredBefore,
        hospitalContact: bankForm.hospitalContact,
        reason: bankForm.reason.trim() || undefined,
      });
      setSuccess({ type: 'bloodbank', requestId: response.requestId });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send blood bank request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="blood-request-page hospital-send-request find-donor-page">
      <PageHeader
        title="Send blood request"
        subtitle="Select a patient, then send to chosen donors or request stock from a blood bank."
      />

      <div className="hospital-send-request__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`hospital-send-request__tab ${requestTab === 'donors' ? 'hospital-send-request__tab--active' : ''}`}
          onClick={() => setRequestTab('donors')}
        >
          Send to donors
        </button>
        <button
          type="button"
          role="tab"
          className={`hospital-send-request__tab ${requestTab === 'bloodbank' ? 'hospital-send-request__tab--active' : ''}`}
          onClick={() => setRequestTab('bloodbank')}
        >
          Request from blood bank
        </button>
      </div>

      <GpsCaptureButton
        required
        onCapture={setLiveLocation}
        label="Update hospital live location (GPS)"
        capturedLabel="Hospital live location ready"
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
            {selectedPatient.unitsRequired ? ` · ${selectedPatient.unitsRequired} unit(s)` : ''}
          </p>
        )}
      </section>

      {error && <p className="blood-request-page__error">{error}</p>}

      {success?.type === 'donors' && (
        <div className="blood-request-page__success" role="status">
          Request sent to {success.count} donor(s).
          {success.requestGroupId && (
            <span> Group ID: {success.requestGroupId.slice(0, 8)}…</span>
          )}
          {' '}
          <Link to={ROUTES.HOSPITAL_REQUESTS}>View sent requests</Link>
        </div>
      )}

      {success?.type === 'bloodbank' && (
        <div className="blood-request-page__success" role="status">
          Blood bank request #{success.requestId} submitted successfully.
        </div>
      )}

      {requestTab === 'donors' && (
        <>
          <DonorPickerSection
            bloodGroup={selectedPatient?.bloodGroup}
            pincode={profile?.pincode}
            liveLocation={liveLocation}
            selectedDonorIds={selectedDonorIds}
            onSelectionChange={setSelectedDonorIds}
            disabled={submitLoading}
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
                {EMERGENCY_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
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
                disabled={submitLoading || !patientId || selectedDonorIds.length === 0}
                onClick={() => sendToDonors('selected')}
              >
                {submitLoading ? 'Sending…' : `Send to selected (${selectedDonorIds.length})`}
              </button>
              <button
                type="button"
                className="blood-request-page__submit"
                disabled={submitLoading || !patientId}
                onClick={() => sendToDonors('all')}
              >
                {submitLoading ? 'Sending…' : 'Broadcast to all nearby donors'}
              </button>
            </div>
          </form>
        </>
      )}

      {requestTab === 'bloodbank' && (
        <form className="blood-request-page__form" onSubmit={sendToBloodBank}>
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
            Emergency level
            <select name="emergencyLevel" value={bankForm.emergencyLevel} onChange={handleBankChange}>
              {EMERGENCY_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
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
          <label className="blood-request-page__field">
            Hospital contact phone
            <input type="tel" name="hospitalContact" value={bankForm.hospitalContact} onChange={handleBankChange} required />
          </label>
          <button type="submit" className="blood-request-page__submit" disabled={submitLoading || !patientId}>
            {submitLoading ? 'Sending…' : 'Send to blood bank'}
          </button>
        </form>
      )}
    </div>
  );
}

export default HospitalSendRequestPage;
