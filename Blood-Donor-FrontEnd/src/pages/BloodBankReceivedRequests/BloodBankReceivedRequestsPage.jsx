import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import {
  acceptReceivedBloodRequest,
  approveBloodBankHospitalRequest,
  listBloodBankHospitalRequests,
  listReceivedBloodRequests,
  rejectBloodBankHospitalRequest,
  rejectReceivedBloodRequest,
} from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import {
  HOSPITAL_BLOOD_BANK_REQUEST_STATUS_LABELS,
  REQUESTER_TYPE_LABELS,
} from '../../utils/constants';
import '../HospitalRequests/HospitalRequestsPage.css';
import '../BloodBankHospitalRequests/BloodBankHospitalRequestsPage.css';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function groupPendingRoutingRequests(requests) {
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
  const [activeTab, setActiveTab] = useState('units');
  const [unitRequests, setUnitRequests] = useState([]);
  const [routingRequests, setRoutingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionKey, setActionKey] = useState(null);

  const groupedRoutingRequests = useMemo(
    () => groupPendingRoutingRequests(routingRequests),
    [routingRequests],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [units, routing] = await Promise.all([
        listBloodBankHospitalRequests(),
        listReceivedBloodRequests(),
      ]);
      setUnitRequests(units);
      setRoutingRequests(routing);
    } catch (err) {
      setUnitRequests([]);
      setRoutingRequests([]);
      setError(err instanceof ApiError ? err.message : 'Failed to load received requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApproveUnit = async (requestId) => {
    setActionKey(`unit-${requestId}`);
    setError('');
    setSuccess('');
    try {
      await approveBloodBankHospitalRequest(requestId);
      setSuccess(`Request #${requestId} approved and blood issued.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Approve failed.');
    } finally {
      setActionKey(null);
    }
  };

  const handleRejectUnit = async (requestId) => {
    setActionKey(`unit-${requestId}`);
    setError('');
    setSuccess('');
    try {
      await rejectBloodBankHospitalRequest(requestId);
      setSuccess(`Request #${requestId} rejected.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reject failed.');
    } finally {
      setActionKey(null);
    }
  };

  const handleAcceptRouting = async (group) => {
    setActionKey(`routing-${group.key}`);
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

  const handleRejectRouting = async (group) => {
    setActionKey(`routing-${group.key}`);
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
        subtitle="Hospital and user unit requests, plus donor routing requests from nearby users and hospitals."
      />

      <div className="hospital-send-request__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`hospital-send-request__tab ${activeTab === 'units' ? 'hospital-send-request__tab--active' : ''}`}
          onClick={() => setActiveTab('units')}
        >
          Blood unit requests ({unitRequests.length})
        </button>
        <button
          type="button"
          role="tab"
          className={`hospital-send-request__tab ${activeTab === 'routing' ? 'hospital-send-request__tab--active' : ''}`}
          onClick={() => setActiveTab('routing')}
        >
          Donor routing ({groupedRoutingRequests.length})
        </button>
      </div>

      {error && <p className="hospital-requests__error">{error}</p>}
      {success && <p className="blood-bank-requests__success">{success}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : activeTab === 'units' ? (
        unitRequests.length === 0 ? (
          <p>No pending blood unit requests from hospitals or users.</p>
        ) : (
          <div className="hospital-requests__table-wrap">
            <table className="hospital-requests__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>Patient</th>
                  <th>Blood</th>
                  <th>Units</th>
                  <th>Contact</th>
                  <th>Emergency</th>
                  <th>Required before</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unitRequests.map((r) => (
                  <tr key={r.requestId}>
                    <td>{r.requestId}</td>
                    <td>{r.hospitalName}</td>
                    <td>
                      {r.patientName} ({r.patientAge}, {r.gender})
                    </td>
                    <td>{r.bloodGroup}</td>
                    <td>{r.requiredUnits}</td>
                    <td>{r.hospitalContact}</td>
                    <td>{r.emergencyLevel}</td>
                    <td>{formatDateTime(r.requiredBefore)}</td>
                    <td>{HOSPITAL_BLOOD_BANK_REQUEST_STATUS_LABELS[r.status] || r.status}</td>
                    <td className="blood-bank-requests__actions">
                      {r.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            className="blood-bank-requests__approve"
                            disabled={actionKey === `unit-${r.requestId}`}
                            onClick={() => handleApproveUnit(r.requestId)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="blood-bank-requests__reject"
                            disabled={actionKey === `unit-${r.requestId}`}
                            onClick={() => handleRejectUnit(r.requestId)}
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
        )
      ) : groupedRoutingRequests.length === 0 ? (
        <p>No pending donor routing requests.</p>
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
              {groupedRoutingRequests.map((group) => (
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
                      disabled={actionKey === `routing-${group.key}`}
                      onClick={() => handleAcceptRouting(group)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="blood-bank-requests__reject"
                      disabled={actionKey === `routing-${group.key}`}
                      onClick={() => handleRejectRouting(group)}
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
