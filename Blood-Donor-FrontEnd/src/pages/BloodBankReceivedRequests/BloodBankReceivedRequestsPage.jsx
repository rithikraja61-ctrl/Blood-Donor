import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import {
  acceptReceivedBloodRequest,
  listReceivedBloodRequests,
  rejectReceivedBloodRequest,
} from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import { REQUESTER_TYPE_LABELS } from '../../utils/constants';
import '../HospitalRequests/HospitalRequestsPage.css';
import '../BloodBankHospitalRequests/BloodBankHospitalRequestsPage.css';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function groupPendingRequests(requests) {
  const groups = new Map();

  for (const req of requests) {
    const key = req.requestGroupId || String(req.id);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        pendingRequestId: req.id,
        requesterType: req.requesterType,
        requesterName: req.requesterName || req.hospitalName,
        patientName: req.patientName,
        bloodGroup: req.requiredBloodGroupDisplay,
        contactPersonName: req.contactPersonName,
        contactPhoneNumber: req.contactPhoneNumber,
        emergencyLevel: req.emergencyLevel,
        requiredBeforeDateTime: req.requiredBeforeDateTime,
        createdAt: req.createdAt,
        donorCount: 0,
      });
    }
    const group = groups.get(key);
    group.donorCount += 1;
  }

  return [...groups.values()];
}

function BloodBankReceivedRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionKey, setActionKey] = useState(null);

  const groupedRequests = useMemo(() => groupPendingRequests(requests), [requests]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await listReceivedBloodRequests());
    } catch (err) {
      setRequests([]);
      setError(err instanceof ApiError ? err.message : 'Failed to load received requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (group) => {
    setActionKey(group.key);
    setError('');
    setSuccess('');
    try {
      const result = await acceptReceivedBloodRequest(group.pendingRequestId);
      setSuccess(
        `Request accepted — donor ${result.donorName || 'assigned'} will fulfill this request.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Accept failed.');
    } finally {
      setActionKey(null);
    }
  };

  const handleReject = async (group) => {
    setActionKey(group.key);
    setError('');
    setSuccess('');
    try {
      await rejectReceivedBloodRequest(group.pendingRequestId);
      setSuccess('Request rejected.');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reject failed.');
    } finally {
      setActionKey(null);
    }
  };

  return (
    <div className="hospital-requests blood-bank-requests">
      <PageHeader
        title="Received requests"
        subtitle="Pending blood requests from users and hospitals — accept to assign a donor or reject."
      />

      {error && <p className="hospital-requests__error">{error}</p>}
      {success && <p className="blood-bank-requests__success">{success}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : groupedRequests.length === 0 ? (
        <p>No pending received requests.</p>
      ) : (
        <div className="hospital-requests__table-wrap">
          <table className="hospital-requests__table">
            <thead>
              <tr>
                <th>From</th>
                <th>Requester</th>
                <th>Patient</th>
                <th>Blood</th>
                <th>Contact</th>
                <th>Emergency</th>
                <th>Required before</th>
                <th>Donors notified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedRequests.map((group) => (
                <tr key={group.key}>
                  <td>{REQUESTER_TYPE_LABELS[group.requesterType] || group.requesterType}</td>
                  <td>{group.requesterName || '—'}</td>
                  <td>{group.patientName || '—'}</td>
                  <td>{group.bloodGroup}</td>
                  <td>
                    {group.contactPersonName}
                    <br />
                    <small>{group.contactPhoneNumber}</small>
                  </td>
                  <td>{group.emergencyLevel}</td>
                  <td>{formatDateTime(group.requiredBeforeDateTime)}</td>
                  <td>{group.donorCount}</td>
                  <td className="blood-bank-requests__actions">
                    <button
                      type="button"
                      className="blood-bank-requests__approve"
                      disabled={actionKey === group.key}
                      onClick={() => handleAccept(group)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="blood-bank-requests__reject"
                      disabled={actionKey === group.key}
                      onClick={() => handleReject(group)}
                    >
                      Reject
                    </button>
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

export default BloodBankReceivedRequestsPage;
