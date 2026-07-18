import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import CommonInput from '../../components/auth/CommonInput';
import {
  decreaseBloodBankStock,
  getBloodBankInventory,
  increaseBloodBankStock,
} from '../../services/bloodBankService';
import { ApiError } from '../../services/apiClient';
import {
  BLOOD_GROUPS,
  DEFAULT_BLOOD_SHELF_LIFE_DAYS,
  defaultBloodExpiryDateString,
} from '../../utils/constants';
import './BloodBankInventoryPage.css';

function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

function mergeInventoryRow(inventory, updatedRow) {
  return inventory.map((row) =>
    row.bloodGroup === updatedRow.bloodGroup ? { ...row, ...updatedRow } : row,
  );
}

function BloodBankInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addForm, setAddForm] = useState({
    bloodGroup: 'O+',
    units: '1',
    notes: '',
  });
  const [decreaseUnits, setDecreaseUnits] = useState('1');
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

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIncomingBlood = async (e) => {
    e.preventDefault();
    const units = Number(addForm.units);
    if (!Number.isFinite(units) || units < 1) {
      setError('Enter at least 1 unit to add.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const updatedRow = await increaseBloodBankStock({
        bloodGroup: addForm.bloodGroup,
        units,
      });
      setInventory((prev) => mergeInventoryRow(prev, updatedRow));
      setSuccess(
        `Added ${units} unit(s) of ${addForm.bloodGroup}. Expiry set to ${toDateInputValue(updatedRow.expiryDate)} (${DEFAULT_BLOOD_SHELF_LIFE_DAYS} days from today).`,
      );
      setAddForm((prev) => ({
        ...prev,
        units: '1',
        notes: '',
      }));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add blood stock.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecrease = async () => {
    const units = Number(decreaseUnits);
    if (!Number.isFinite(units) || units < 1) {
      setError('Enter at least 1 unit to remove.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const updatedRow = await decreaseBloodBankStock({
        bloodGroup: addForm.bloodGroup,
        units,
      });
      setInventory((prev) => mergeInventoryRow(prev, updatedRow));
      setSuccess(`Removed ${units} unit(s) for ${addForm.bloodGroup}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Decrease failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const defaultExpiry = defaultBloodExpiryDateString();

  return (
    <div className="blood-bank-inventory">
      <PageHeader
        title="Blood inventory"
        subtitle="Add incoming units — expiry is set automatically when stock is added."
      />

      {error && <p className="blood-bank-inventory__error">{error}</p>}
      {success && <p className="blood-bank-inventory__success">{success}</p>}

      <section className="blood-bank-inventory__add-panel">
        <h2 className="blood-bank-inventory__panel-title">Add incoming blood</h2>
        <p className="blood-bank-inventory__panel-hint">
          Expiry is applied automatically ({DEFAULT_BLOOD_SHELF_LIFE_DAYS} days from today — next batch expires {defaultExpiry}).
        </p>
        <form className="blood-bank-inventory__add-form" onSubmit={handleAddIncomingBlood}>
          <CommonInput
            id="bloodGroup"
            label="Blood group"
            name="bloodGroup"
            type="select"
            value={addForm.bloodGroup}
            onChange={handleAddFormChange}
            options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))}
          />
          <CommonInput
            id="units"
            label="Units received"
            name="units"
            type="number"
            value={addForm.units}
            onChange={handleAddFormChange}
          />
          <CommonInput
            id="notes"
            label="Notes (optional)"
            name="notes"
            value={addForm.notes}
            onChange={handleAddFormChange}
            placeholder="Batch / donation camp reference"
          />
          <div className="blood-bank-inventory__form-actions">
            <button type="submit" className="auth-form__submit" disabled={actionLoading}>
              {actionLoading ? 'Adding…' : 'Add to inventory'}
            </button>
            <div className="blood-bank-inventory__decrease-row">
              <label htmlFor="decreaseUnits">Remove units</label>
              <input
                id="decreaseUnits"
                type="number"
                min="1"
                value={decreaseUnits}
                onChange={(e) => setDecreaseUnits(e.target.value)}
              />
              <button
                type="button"
                className="blood-bank-inventory__secondary"
                disabled={actionLoading}
                onClick={handleDecrease}
              >
                Decrease
              </button>
            </div>
          </div>
        </form>
      </section>

      {loading ? (
        <p>Loading inventory…</p>
      ) : (
        <div className="blood-bank-inventory__table-wrap">
          <h2 className="blood-bank-inventory__panel-title">Current stock</h2>
          <table className="blood-bank-inventory__table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Issued</th>
                <th>Expiry</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((row) => (
                <tr key={row.bloodGroup}>
                  <td><strong>{row.bloodGroup}</strong></td>
                  <td>{row.availableUnits}</td>
                  <td>{row.reservedUnits}</td>
                  <td>{row.issuedUnits}</td>
                  <td>{row.expiryDate ? toDateInputValue(row.expiryDate) : '—'}</td>
                  <td>{row.lastUpdated ? new Date(row.lastUpdated).toLocaleString() : '—'}</td>
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
