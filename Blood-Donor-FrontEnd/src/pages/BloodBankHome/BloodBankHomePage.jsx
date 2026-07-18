import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BloodTypePieChart from '../../components/bloodbank/BloodTypePieChart';
import { getBloodBankDashboard } from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import { ROUTES } from '../../utils/constants';
import '../DonorHome/DonorHomePage.css';
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
        { label: 'Approved (hospital)', value: dashboard.totalBloodRequestsApproved, tone: 'success' },
        { label: 'Rejected (hospital)', value: dashboard.totalBloodRequestsRejected, tone: 'danger' },
        { label: 'Units issued', value: dashboard.totalBloodUnitsIssued, tone: 'primary' },
        { label: 'Expired units', value: dashboard.totalExpiredBloodUnits, tone: 'warning' },
        { label: "Today's hospital requests", value: dashboard.todaysRequests, tone: 'info' },
        { label: 'Monthly issued', value: dashboard.monthlyBloodIssued, tone: 'purple' },
      ]
    : [];

  return (
    <div className="donor-home blood-bank-home">
      <h1 className="donor-home__title">
        Welcome{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="donor-home__subtitle">Inventory, received routing requests, and donor broadcasts.</p>

      {error && <p className="donor-home__error">{error}</p>}

      {loading ? (
        <p className="donor-home__loading">Loading dashboard…</p>
      ) : dashboard && (
        <>
          <section className="blood-bank-home__requests" aria-label="Request overview">
            <Link
              to={ROUTES.BLOOD_BANK_RECEIVED_REQUESTS}
              className="blood-bank-home__request-card blood-bank-home__request-card--received"
            >
              <span className="blood-bank-home__request-icon" aria-hidden="true">📥</span>
              <div>
                <h2>Received requests</h2>
                <p>Blood requests from users and hospitals to nearby donors</p>
              </div>
              <div className="blood-bank-home__request-counts">
                <div>
                  <strong>{dashboard.receivedRoutingRequestsPending ?? 0}</strong>
                  <span>Pending</span>
                </div>
              </div>
            </Link>

            <Link
              to={ROUTES.BLOOD_BANK_SEND_REQUEST}
              className="blood-bank-home__request-card blood-bank-home__request-card--send"
            >
              <span className="blood-bank-home__request-icon" aria-hidden="true">📤</span>
              <div>
                <h2>Send requests</h2>
                <p>Broadcast blood requests from your blood bank to nearby donors</p>
              </div>
              <div className="blood-bank-home__request-counts">
                <div>
                  <strong>{dashboard.sentDonorRequestsPending ?? 0}</strong>
                  <span>Pending</span>
                </div>
              </div>
            </Link>
          </section>

          <section aria-label="Available blood by type">
            <h2 className="blood-bank-home__section-title">Available blood by type</h2>
            <BloodTypePieChart data={dashboard.availabilityByBloodType || []} />
          </section>

          <section className="blood-bank-home__stats-section" aria-label="Other statistics">
            <h2 className="blood-bank-home__section-title">Overview statistics</h2>
            <div className="blood-bank-home__stats">
              {stats.map((stat, index) => (
                <article
                  key={stat.label}
                  className={`blood-bank-home__stat blood-bank-home__stat--${stat.tone}`}
                  style={{ animationDelay: `${index * 0.07}s` }}
                >
                  <span className="blood-bank-home__stat-label">{stat.label}</span>
                  <strong className="blood-bank-home__stat-value">{stat.value}</strong>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="donor-home__cards blood-bank-home__quick-links">
        <Link to={ROUTES.BLOOD_BANK_INVENTORY} className="donor-home__card blood-bank-home__quick-link blood-bank-home__quick-link--inventory">
          <span className="donor-home__card-icon" aria-hidden="true">🩸</span>
          <span className="donor-home__card-label">Manage inventory</span>
        </Link>
        <Link to={ROUTES.BLOOD_BANK_RECEIVED_REQUESTS} className="donor-home__card blood-bank-home__quick-link blood-bank-home__quick-link--received">
          <span className="donor-home__card-icon" aria-hidden="true">📥</span>
          <span className="donor-home__card-label">Received requests</span>
        </Link>
        <Link to={ROUTES.BLOOD_BANK_SEND_REQUEST} className="donor-home__card blood-bank-home__quick-link blood-bank-home__quick-link--send">
          <span className="donor-home__card-icon" aria-hidden="true">📤</span>
          <span className="donor-home__card-label">Send request</span>
        </Link>
        <Link to={ROUTES.BLOOD_BANK_HOSPITAL_REQUESTS} className="donor-home__card blood-bank-home__quick-link blood-bank-home__quick-link--stock">
          <span className="donor-home__card-icon" aria-hidden="true">🏥</span>
          <span className="donor-home__card-label">Stock requests</span>
        </Link>
        <Link to={ROUTES.BLOOD_BANK_ISSUE_HISTORY} className="donor-home__card blood-bank-home__quick-link blood-bank-home__quick-link--history">
          <span className="donor-home__card-icon" aria-hidden="true">📋</span>
          <span className="donor-home__card-label">Issue history</span>
        </Link>
      </div>
    </div>
  );
}

export default BloodBankHomePage;
