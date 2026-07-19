import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDonorDashboard } from '../../services/donorProfileService';
import { ApiError } from '../../services/apiClient';
import { ROUTES } from '../../utils/constants';
import './DonorHomePage.css';

function formatDate(value) {
  if (!value) return 'Never';
  return new Date(value).toLocaleDateString();
}

function DonorHomePage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getDonorDashboard();
      setDashboard(data);
    } catch (err) {
      setDashboard(null);
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        loadDashboard();
      }
    };

    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => document.removeEventListener('visibilitychange', refreshOnFocus);
  }, [loadDashboard]);

  const displayName = dashboard?.donorName || user?.name;

  return (
    <div className="donor-home">
      <h1 className="donor-home__title">
        Welcome{displayName ? `, ${displayName}` : ''}
      </h1>
      <p className="donor-home__subtitle">
        Your donation activity and incoming requests at a glance.
      </p>

      {error && <p className="donor-home__error">{error}</p>}

      {loading ? (
        <p className="donor-home__loading">Loading dashboard…</p>
      ) : dashboard && (
        <section className="donor-dashboard" aria-label="Donor dashboard">
          <div className="donor-dashboard__stats">
            <article className="donor-dashboard__stat">
              <span className="donor-dashboard__stat-label">Last donation</span>
              <strong className="donor-dashboard__stat-value">
                {formatDate(dashboard.lastDonationDate)}
              </strong>
            </article>
            <article className="donor-dashboard__stat">
              <span className="donor-dashboard__stat-label">Donations made</span>
              <strong className="donor-dashboard__stat-value">
                {dashboard.totalDonationsMade}
              </strong>
            </article>
            <article className="donor-dashboard__stat donor-dashboard__stat--highlight">
              <span className="donor-dashboard__stat-label">Pending requests</span>
              <strong className="donor-dashboard__stat-value">
                {dashboard.pendingRequestsCount}
              </strong>
            </article>
          </div>

          {dashboard.bloodGroupDisplay && (
            <p className="donor-dashboard__blood-group">
              Blood group: <strong>{dashboard.bloodGroupDisplay}</strong>
            </p>
          )}
        </section>
      )}

      <div className="donor-home__cards">
        <Link to={ROUTES.DONOR_REQUESTS} className="donor-home__card donor-home__card--primary">
          <span className="donor-home__card-icon" aria-hidden="true">📥</span>
          <span className="donor-home__card-label">Incoming Requests</span>
          {dashboard?.pendingRequestsCount > 0 && (
            <span className="donor-home__badge">{dashboard.pendingRequestsCount} pending</span>
          )}
        </Link>
        <Link to={ROUTES.DONOR_PROFILE} className="donor-home__card">
          <span className="donor-home__card-icon" aria-hidden="true">👤</span>
          <span className="donor-home__card-label">My Profile</span>
        </Link>
      </div>
    </div>
  );
}

export default DonorHomePage;
