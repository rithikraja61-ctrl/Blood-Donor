import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHospitalDashboard } from '../../services/hospitalService';
import { ApiError } from '../../services/apiClient';
import { ROUTES } from '../../utils/constants';
import '../DonorHome/DonorHomePage.css';

function HospitalHomePage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDashboard(await getHospitalDashboard());
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

  return (
    <div className="donor-home">
      <h1 className="donor-home__title">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
      <p className="donor-home__subtitle">Hospital blood coordination overview.</p>

      {error && <p className="donor-home__error">{error}</p>}

      {loading ? (
        <p className="donor-home__loading">Loading dashboard…</p>
      ) : dashboard && (
        <section className="donor-dashboard" aria-label="Hospital dashboard">
          <div className="donor-dashboard__stats">
            <article className="donor-dashboard__stat">
              <span className="donor-dashboard__stat-label">Patients waiting for blood</span>
              <strong className="donor-dashboard__stat-value">
                {dashboard.totalPatientsWaitingForBlood}
              </strong>
            </article>
            <article className="donor-dashboard__stat">
              <span className="donor-dashboard__stat-label">Patients received donor</span>
              <strong className="donor-dashboard__stat-value">
                {dashboard.totalPatientsSuccessfullyReceivedBlood}
              </strong>
            </article>
            <article className="donor-dashboard__stat donor-dashboard__stat--highlight">
              <span className="donor-dashboard__stat-label">Active donors (accepted)</span>
              <strong className="donor-dashboard__stat-value">
                {dashboard.totalActiveDonorsWhoAcceptedRequests}
              </strong>
            </article>
          </div>
        </section>
      )}

      <div className="donor-home__cards">
        <Link to={ROUTES.HOSPITAL_PATIENTS} className="donor-home__card donor-home__card--primary">
          <span className="donor-home__card-icon" aria-hidden="true">🩸</span>
          <span className="donor-home__card-label">Manage patients</span>
        </Link>
        <Link to={ROUTES.HOSPITAL_SEND_REQUEST} className="donor-home__card">
          <span className="donor-home__card-icon" aria-hidden="true">📤</span>
          <span className="donor-home__card-label">Send blood request</span>
        </Link>
        <Link to={ROUTES.HOSPITAL_REQUESTS} className="donor-home__card">
          <span className="donor-home__card-icon" aria-hidden="true">📋</span>
          <span className="donor-home__card-label">Sent requests</span>
        </Link>
      </div>
    </div>
  );
}

export default HospitalHomePage;
