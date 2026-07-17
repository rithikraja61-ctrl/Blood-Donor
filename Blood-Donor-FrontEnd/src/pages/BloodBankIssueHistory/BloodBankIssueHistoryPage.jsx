import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { getBloodBankIssueHistory } from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import '../HospitalRequests/HospitalRequestsPage.css';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function BloodBankIssueHistoryPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setIssues(await getBloodBankIssueHistory());
    } catch (err) {
      setIssues([]);
      setError(err instanceof ApiError ? err.message : 'Failed to load issue history.');
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
        title="Blood issue history"
        subtitle="Record of blood units issued to hospitals."
      />

      {error && <p className="hospital-requests__error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : issues.length === 0 ? (
        <p>No issues recorded yet.</p>
      ) : (
        <div className="hospital-requests__table-wrap">
          <table className="hospital-requests__table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Hospital</th>
                <th>Patient</th>
                <th>Blood group</th>
                <th>Units</th>
                <th>Issue date</th>
                <th>Issued by</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.issueId}>
                  <td>{issue.issueId}</td>
                  <td>{issue.hospitalName}</td>
                  <td>{issue.patientName}</td>
                  <td>{issue.bloodGroup}</td>
                  <td>{issue.units}</td>
                  <td>{formatDateTime(issue.issueDate)}</td>
                  <td>{issue.issuedBy}</td>
                  <td>{issue.status}</td>
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

export default BloodBankIssueHistoryPage;
