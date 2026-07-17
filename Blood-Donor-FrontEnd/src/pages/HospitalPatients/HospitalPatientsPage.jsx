import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import CommonInput from '../../components/auth/CommonInput';
import {
  BLOOD_GROUPS,
  BLOOD_GROUP_TO_TYPE,
  PATIENT_REQUEST_STATUS_LABELS,
  ROUTES,
} from '../../utils/constants';
import {
  createPatient,
  deletePatient,
  listPatients,
} from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import './HospitalPatientsPage.css';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const EMPTY_PATIENT = {
  patientName: '',
  age: '',
  gender: 'MALE',
  bloodGroup: 'O+',
  unitsRequired: '1',
  reasonForBlood: '',
  requiredBeforeDate: '',
};

function HospitalPatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(EMPTY_PATIENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPatients(await listPatients());
    } catch (err) {
      setPatients([]);
      setError(err instanceof ApiError ? err.message : 'Failed to load patients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createPatient({
        patientName: form.patientName.trim(),
        age: Number(form.age),
        gender: form.gender,
        bloodType: BLOOD_GROUP_TO_TYPE[form.bloodGroup],
        unitsRequired: Number(form.unitsRequired),
        reasonForBlood: form.reasonForBlood.trim(),
        requiredBeforeDate: form.requiredBeforeDate,
      });
      setForm(EMPTY_PATIENT);
      await loadPatients();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add patient.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (!window.confirm('Delete this patient?')) return;
    setError('');
    try {
      await deletePatient(patientId);
      await loadPatients();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete patient.');
    }
  };

  const bloodGroupOptions = [{ value: '', label: 'Blood group' }, ...BLOOD_GROUPS.map((g) => ({ value: g, label: g }))];

  return (
    <div className="hospital-patients">
      <PageHeader
        title="Blood needed patients"
        subtitle="Add and manage patients who need blood."
      />

      {error && <p className="hospital-patients__error">{error}</p>}

      <form className="hospital-patients__form" onSubmit={handleAddPatient}>
        <h3>Add patient</h3>
        <div className="hospital-patients__form-grid">
          <CommonInput id="patientName" label="Patient name" name="patientName" value={form.patientName} onChange={handleFormChange} required />
          <CommonInput id="age" label="Age" name="age" type="number" value={form.age} onChange={handleFormChange} required />
          <CommonInput id="gender" label="Gender" name="gender" type="select" value={form.gender} onChange={handleFormChange} options={GENDER_OPTIONS} />
          <CommonInput id="bloodGroup" label="Blood group" name="bloodGroup" type="select" value={form.bloodGroup} onChange={handleFormChange} options={bloodGroupOptions} />
          <CommonInput id="unitsRequired" label="Units required" name="unitsRequired" type="number" value={form.unitsRequired} onChange={handleFormChange} />
          <CommonInput id="requiredBeforeDate" label="Required before" name="requiredBeforeDate" type="date" value={form.requiredBeforeDate} onChange={handleFormChange} required />
          <CommonInput id="reasonForBlood" label="Reason" name="reasonForBlood" value={form.reasonForBlood} onChange={handleFormChange} required />
        </div>
        <button type="submit" className="auth-form__submit" disabled={saving}>
          {saving ? 'Adding…' : 'Add patient'}
        </button>
      </form>

      <section className="hospital-patients__list">
        <h3>All patients</h3>
        {loading ? (
          <p>Loading…</p>
        ) : patients.length === 0 ? (
          <p>No patients yet.</p>
        ) : (
          <div className="hospital-patients__table-wrap">
            <table className="hospital-patients__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Blood</th>
                  <th>Donor assigned</th>
                  <th>Donor ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.patientName}</td>
                    <td>{p.age}</td>
                    <td>{p.bloodGroup}</td>
                    <td>{p.donorAssigned ? 'Yes' : 'No'}</td>
                    <td>{p.assignedDonorId ?? '—'}</td>
                    <td>{PATIENT_REQUEST_STATUS_LABELS[p.patientRequestStatus] || p.patientRequestStatus}</td>
                    <td className="hospital-patients__actions">
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.HOSPITAL_SEND_REQUEST, { state: { patientId: p.id } })}
                      >
                        Send request
                      </button>
                      <button type="button" className="hospital-patients__delete" onClick={() => handleDelete(p.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link to={ROUTES.HOSPITAL_SEND_REQUEST} className="hospital-patients__link">
        Go to send blood request →
      </Link>
    </div>
  );
}

export default HospitalPatientsPage;
