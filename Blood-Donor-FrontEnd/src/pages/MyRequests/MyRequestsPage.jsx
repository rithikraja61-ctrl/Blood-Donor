import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { listUserBloodRequests } from '../../services/bloodRequestService';
import { ApiError } from '../../services/apiClient';
import { BLOOD_REQUEST_STATUS_LABELS } from '../../utils/constants';
import './MyRequestsPage.css';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listUserBloodRequests();
      setRequests(data);
    } catch (err) {
      setRequests([]);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load your blood requests.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <div className="my-requests-page">
      <PageHeader
        title="My Blood Requests"
        subtitle="Track status of requests broadcast to nearby donors."
      />

      {error && <p className="my-requests-page__error">{error}</p>}

      {loading ? (
        <p className="my-requests-page__loading">Loading requests…</p>
      ) : requests.length === 0 ? (
        <EmptyState message="No blood requests yet." />
      ) : (
        <div className="my-requests-page__list">
          {requests.map((req) => (
            <article key={req.id} className="my-requests-page__card">
              <div className="my-requests-page__card-header">
                <span className={`my-requests-page__status my-requests-page__status--${req.status.toLowerCase()}`}>
                  {BLOOD_REQUEST_STATUS_LABELS[req.status] || req.status}
                </span>
                <span className="my-requests-page__date">{formatDateTime(req.createdAt)}</span>
              </div>
              <p><strong>Blood:</strong> {req.requiredBloodGroupDisplay}</p>
              <p><strong>Units:</strong> {req.unitsOfBloodRequired}</p>
              <p><strong>Donor:</strong> {req.donorName || '—'}</p>
              <p><strong>Emergency:</strong> {req.emergencyLevel}</p>
              <p><strong>Required by:</strong> {formatDateTime(req.requiredBeforeDateTime)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRequestsPage;
