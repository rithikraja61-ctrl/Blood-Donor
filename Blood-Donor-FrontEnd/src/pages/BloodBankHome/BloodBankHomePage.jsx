import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BloodTypePieChart from '../../components/bloodbank/BloodTypePieChart';
import { getBloodBankDashboard } from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import { ROUTES } from '../../utils/constants';
import '../DonorHome/DonorHomePage.css';
import './BloodBankHomePage.css';
import './BloodBankHomePage.css';

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
        { label: 'Approved (hospital)', value: dashboard.totalBloodRequestsApproved },
        { label: 'Rejected (hospital)', value: dashboard.totalBloodRequestsRejected },
        { label: 'Units issued', value: dashboard.totalBloodUnitsIssued, highlight: true },
        { label: 'Expired units', value: dashboard.totalExpiredBloodUnits },
        { label: "Today's hospital requests", value: dashboard.todaysRequests },
        { label: 'Monthly issued', value: dashboard.monthlyBloodIssued },
      ]
    : [];

  return (
    <div className="donor-home blood-bank-home">
      <h1 className="donor-home__title">
        Welcome{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="donor-home__subtitle">Inventory, hospital stock requests, and donor routing overview.</p>

      {error && <p className="donor-home__error">{error}</p>}

      {loading ? (
        <p className="donor-home__loading">Loading dashboard…</p>
      ) : dashboard && (
        <>
          <section className="blood-bank-home__requests" aria-label="Request overview">
            <Link to={ROUTES.BLOOD_BANK_HOSPITAL_REQUESTS} className="blood-bank-home__request-card">
              <span className="blood-bank-home__request-icon" aria-hidden="true">🏥</span>
              <div>
                <h2>Hospital requests</h2>
                <p>Stock requests from hospitals to this blood bank</p>
              </div>
              <div className="blood-bank-home__request-counts">
                <div>
                  <strong>{dashboard.hospitalRequestsPending ?? dashboard.totalPendingRequests}</strong>
                  <span>Pending</span>
                </div>
                <div>
                  <strong>{dashboard.hospitalRequestsTotal ?? dashboard.totalBloodRequestsReceived}</strong>
                  <span>Total</span>
                </div>
              </div>
            </Link>

            <article className="blood-bank-home__request-card blood-bank-home__request-card--donor">
              <span className="blood-bank-home__request-icon" aria-hidden="true">🩸</span>
              <div>
                <h2>Donor requests</h2>
                <p>Active user/hospital → donor blood requests in the system</p>
              </div>
              <div className="blood-bank-home__request-counts">
                <div>
                  <strong>{dashboard.donorRequestsPending ?? 0}</strong>
                  <span>Pending</span>
                </div>
                <div>
                  <strong>{dashboard.donorRequestsTotal ?? 0}</strong>
                  <span>Total</span>
                </div>
              </div>
            </article>
          </section>

          <section aria-label="Available blood by type">
            <h2 className="blood-bank-home__section-title">Available blood by type</h2>
            <BloodTypePieChart data={dashboard.availabilityByBloodType || []} />
          </section>

          <section className="donor-dashboard" aria-label="Other statistics">
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
        </>
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
