import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { BLOOD_REQUEST_STATUS_LABELS } from '../../utils/constants';
import { listHospitalBloodRequests } from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import './HospitalRequestsPage.css';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function HospitalRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await listHospitalBloodRequests());
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

  return (
    <div className="hospital-requests">
      <PageHeader
        title="Sent blood requests"
        subtitle="Track status and donor responses."
      />

      {error && <p className="hospital-requests__error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : requests.length === 0 ? (
        <p>No requests sent yet.</p>
      ) : (
        <div className="hospital-requests__table-wrap">
          <table className="hospital-requests__table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Patient</th>
                <th>Donor</th>
                <th>Blood</th>
                <th>Emergency</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.patientName}</td>
                  <td>{r.donorName}</td>
                  <td>{r.requiredBloodGroupDisplay || r.requiredBloodGroup}</td>
                  <td>{r.emergencyLevel}</td>
                  <td>{BLOOD_REQUEST_STATUS_LABELS[r.status] || r.status}</td>
                  <td>{formatDateTime(r.requestSentDateTime || r.createdAt)}</td>
                  <td>{formatDateTime(r.responseDateTime || r.respondedAt)}</td>
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

export default HospitalRequestsPage;
