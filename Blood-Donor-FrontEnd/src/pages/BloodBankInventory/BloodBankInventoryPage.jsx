import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import {
  decreaseBloodBankStock,
  getBloodBankInventory,
  increaseBloodBankStock,
  updateBloodBankInventory,
} from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import { BLOOD_GROUPS } from '../../utils/constants';
import './BloodBankInventoryPage.css';

function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

function BloodBankInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adjustForm, setAdjustForm] = useState({ bloodGroup: 'O+', units: 1, expiryDate: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setInventory(await getBloodBankInventory());
    } catch (err) {
      setInventory([]);
      setError(err instanceof ApiError ? err.message : 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRowUpdate = async (row) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateBloodBankInventory({
        bloodGroup: row.bloodGroup,
        availableUnits: Number(row.availableUnits),
        reservedUnits: Number(row.reservedUnits),
        expiryDate: row.expiryDate || null,
      });
      setSuccess(`Updated ${row.bloodGroup} inventory.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIncrease = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await increaseBloodBankStock({
        bloodGroup: adjustForm.bloodGroup,
        units: Number(adjustForm.units),
        expiryDate: adjustForm.expiryDate || undefined,
      });
      setSuccess(`Added ${adjustForm.units} unit(s) for ${adjustForm.bloodGroup}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Increase failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await decreaseBloodBankStock({
        bloodGroup: adjustForm.bloodGroup,
        units: Number(adjustForm.units),
      });
      setSuccess(`Removed ${adjustForm.units} unit(s) for ${adjustForm.bloodGroup}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Decrease failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateLocalRow = (bloodGroup, field, value) => {
    setInventory((prev) =>
      prev.map((row) => (row.bloodGroup === bloodGroup ? { ...row, [field]: value } : row)),
    );
  };

  return (
    <div className="blood-bank-inventory">
      <PageHeader
        title="Blood inventory"
        subtitle="Stock by blood group — available, reserved, and issued units."
      />

      {error && <p className="blood-bank-inventory__error">{error}</p>}
      {success && <p className="blood-bank-inventory__success">{success}</p>}

      <form className="blood-bank-inventory__adjust" onSubmit={handleIncrease}>
        <label>
          Blood group
          <select
            value={adjustForm.bloodGroup}
            onChange={(e) => setAdjustForm((p) => ({ ...p, bloodGroup: e.target.value }))}
          >
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <label>
          Units
          <input
            type="number"
            min="1"
            value={adjustForm.units}
            onChange={(e) => setAdjustForm((p) => ({ ...p, units: e.target.value }))}
          />
        </label>
        <label>
          Expiry (optional, for increase)
          <input
            type="date"
            value={adjustForm.expiryDate}
            onChange={(e) => setAdjustForm((p) => ({ ...p, expiryDate: e.target.value }))}
          />
        </label>
        <button type="submit" className="auth-form__submit" disabled={actionLoading}>
          Increase stock
        </button>
        <button type="button" className="blood-bank-inventory__secondary" disabled={actionLoading} onClick={handleDecrease}>
          Decrease stock
        </button>
      </form>

      {loading ? (
        <p>Loading inventory…</p>
      ) : (
        <div className="blood-bank-inventory__table-wrap">
          <table className="blood-bank-inventory__table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Issued</th>
                <th>Expiry</th>
                <th>Last updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {inventory.map((row) => (
                <tr key={row.bloodGroup}>
                  <td><strong>{row.bloodGroup}</strong></td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={row.availableUnits}
                      onChange={(e) => updateLocalRow(row.bloodGroup, 'availableUnits', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={row.reservedUnits}
                      onChange={(e) => updateLocalRow(row.bloodGroup, 'reservedUnits', e.target.value)}
                    />
                  </td>
                  <td>{row.issuedUnits}</td>
                  <td>
                    <input
                      type="date"
                      value={toDateInputValue(row.expiryDate)}
                      onChange={(e) => updateLocalRow(row.bloodGroup, 'expiryDate', e.target.value || null)}
                    />
                  </td>
                  <td>{row.lastUpdated ? new Date(row.lastUpdated).toLocaleString() : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="blood-bank-inventory__save"
                      disabled={actionLoading}
                      onClick={() => handleRowUpdate(row)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BloodBankInventoryPage;
