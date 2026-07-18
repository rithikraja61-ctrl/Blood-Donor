import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import {
  approveBloodBankHospitalRequest,
  listBloodBankHospitalRequests,
  rejectBloodBankHospitalRequest,
} from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import { HOSPITAL_BLOOD_BANK_REQUEST_STATUS_LABELS } from '../../utils/constants';
import '../HospitalRequests/HospitalRequestsPage.css';
import './BloodBankHospitalRequestsPage.css';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function BloodBankHospitalRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await listBloodBankHospitalRequests());
    } catch (err) {
      setRequests([]);
      setError(err instanceof ApiError ? err.message : 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (requestId) => {
    setActionId(requestId);
    setError('');
    setSuccess('');
    try {
      await approveBloodBankHospitalRequest(requestId);
      setSuccess(`Request #${requestId} approved and blood issued.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Approve failed.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionId(requestId);
    setError('');
    setSuccess('');
    try {
      await rejectBloodBankHospitalRequest(requestId);
      setSuccess(`Request #${requestId} rejected.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reject failed.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="hospital-requests blood-bank-requests">
      <PageHeader
        title="Stock requests"
        subtitle="Hospital requests for blood units from your inventory — approve or reject."
      />

      {error && <p className="hospital-requests__error">{error}</p>}
      {success && <p className="blood-bank-requests__success">{success}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : requests.length === 0 ? (
        <p>No pending stock requests.</p>
      ) : (
        <div className="hospital-requests__table-wrap">
          <table className="hospital-requests__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hospital</th>
                <th>Patient</th>
                <th>Blood</th>
                <th>Units</th>
                <th>Emergency</th>
                <th>Required before</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.requestId}>
                  <td>{r.requestId}</td>
                  <td>{r.hospitalName}</td>
                  <td>
                    {r.patientName} ({r.patientAge}, {r.gender})
                  </td>
                  <td>{r.bloodGroup}</td>
                  <td>{r.requiredUnits}</td>
                  <td>{r.emergencyLevel}</td>
                  <td>{formatDateTime(r.requiredBefore)}</td>
                  <td>{HOSPITAL_BLOOD_BANK_REQUEST_STATUS_LABELS[r.status] || r.status}</td>
                  <td className="blood-bank-requests__actions">
                    {r.status === 'PENDING' ? (
                      <>
                        <button
                          type="button"
                          className="blood-bank-requests__approve"
                          disabled={actionId === r.requestId}
                          onClick={() => handleApprove(r.requestId)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="blood-bank-requests__reject"
                          disabled={actionId === r.requestId}
                          onClick={() => handleReject(r.requestId)}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button type="button" className="hospital-requests__refresh" onClick={load}>
        Refresh
      </button>
    </div>
  );
}

export default BloodBankHospitalRequestsPage;
