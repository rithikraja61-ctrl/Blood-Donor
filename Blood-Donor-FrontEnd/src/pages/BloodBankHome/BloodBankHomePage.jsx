import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBloodBankDashboard } from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import { ROUTES } from '../../utils/constants';
import '../DonorHome/DonorHomePage.css';

function BloodBankHomePage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDashboard(await getBloodBankDashboard());
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

  const stats = dashboard
    ? [
        { label: 'Units available', value: dashboard.totalBloodUnitsAvailable },
        { label: 'Requests received', value: dashboard.totalBloodRequestsReceived },
        { label: 'Approved', value: dashboard.totalBloodRequestsApproved, highlight: true },
        { label: 'Rejected', value: dashboard.totalBloodRequestsRejected },
        { label: 'Units issued', value: dashboard.totalBloodUnitsIssued },
        { label: 'Pending requests', value: dashboard.totalPendingRequests },
        { label: 'Expired units', value: dashboard.totalExpiredBloodUnits },
        { label: "Today's requests", value: dashboard.todaysRequests },
        { label: 'Monthly issued', value: dashboard.monthlyBloodIssued },
      ]
    : [];

  return (
    <div className="donor-home">
      <h1 className="donor-home__title">
        Welcome{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="donor-home__subtitle">Blood bank inventory and hospital request overview.</p>

      {error && <p className="donor-home__error">{error}</p>}

      {loading ? (
        <p className="donor-home__loading">Loading dashboard…</p>
      ) : dashboard && (
        <section className="donor-dashboard" aria-label="Blood bank dashboard">
          <div className="donor-dashboard__stats">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className={`donor-dashboard__stat ${stat.highlight ? 'donor-dashboard__stat--highlight' : ''}`}
              >
                <span className="donor-dashboard__stat-label">{stat.label}</span>
                <strong className="donor-dashboard__stat-value">{stat.value}</strong>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="donor-home__cards">
        <Link to={ROUTES.BLOOD_BANK_INVENTORY} className="donor-home__card donor-home__card--primary">
          <span className="donor-home__card-icon" aria-hidden="true">🩸</span>
          <span className="donor-home__card-label">Manage inventory</span>
        </Link>
        <Link to={ROUTES.BLOOD_BANK_HOSPITAL_REQUESTS} className="donor-home__card">
          <span className="donor-home__card-icon" aria-hidden="true">🏥</span>
          <span className="donor-home__card-label">Hospital requests</span>
        </Link>
        <Link to={ROUTES.BLOOD_BANK_ISSUE_HISTORY} className="donor-home__card">
          <span className="donor-home__card-icon" aria-hidden="true">📋</span>
          <span className="donor-home__card-label">Issue history</span>
        </Link>
      </div>
    </div>
  );
}

export default BloodBankHomePage;
