import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import DonorRequestCard from '../../components/donor/DonorRequestCard/DonorRequestCard';
import {
  acceptDonorBloodRequest,
  listDonorIncomingRequests,
  rejectDonorBloodRequest,
} from '../../services/bloodRequestService';
import { updateDonorLiveLocation } from '../../services/liveLocationService';
import { getCurrentGpsPosition } from '../../utils/gpsUtils';
import GpsCaptureButton from '../../components/map/GpsCaptureButton';
import { ApiError } from '../../services/apiClient';
import './DonorRequestsPage.css';

function DonorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      try {
        const position = await getCurrentGpsPosition();
        await updateDonorLiveLocation(position.latitude, position.longitude);
      } catch {
        // Donor can still view requests; distance uses last saved location.
      }

      const data = await listDonorIncomingRequests();
      setRequests(data);
    } catch (err) {
      setRequests([]);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load incoming requests.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        loadRequests();
      }
    };

    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => document.removeEventListener('visibilitychange', refreshOnFocus);
  }, [loadRequests]);

  const handleAccept = async (requestId) => {
    setActionLoadingId(requestId);
    setError('');

    try {
      const position = await getCurrentGpsPosition();
      await updateDonorLiveLocation(position.latitude, position.longitude);
      await acceptDonorBloodRequest(requestId, position);
      await loadRequests();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to accept request. Allow GPS and try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoadingId(requestId);
    setError('');

    try {
      await rejectDonorBloodRequest(requestId);
      await loadRequests();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reject request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="donor-requests-page">
      <PageHeader
        title="Incoming Blood Requests"
        subtitle={pendingCount > 0
          ? `${pendingCount} pending request(s) need your response.`
          : 'Review requests sent to you from nearby users and hospitals.'}
      />

      {error && <p className="donor-requests-page__error">{error}</p>}

      <GpsCaptureButton
        onCapture={async (position) => {
          if (!position) return;
          try {
            await updateDonorLiveLocation(position.latitude, position.longitude);
            await loadRequests();
          } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to update live location.');
          }
        }}
        label="Refresh my live location (GPS)"
        capturedLabel="Your live location updated"
      />

      {loading ? (
        <p className="donor-requests-page__loading">Loading requests…</p>
      ) : requests.length === 0 ? (
        <EmptyState message="No incoming blood requests right now." />
      ) : (
        <div className="donor-requests-page__list">
          {requests.map((request) => (
            <DonorRequestCard
              key={request.id}
              request={request}
              onAccept={handleAccept}
              onReject={handleReject}
              actionLoadingId={actionLoadingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DonorRequestsPage;
