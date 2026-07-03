import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { reservationApi, TIME_SLOTS } from '../services/api';

export default function BookReservationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: '',
    timeSlot: TIME_SLOTS[0],
    guestCount: 2,
    tableId: '',
    notes: '',
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const minDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!form.date || !form.timeSlot || !form.guestCount) {
      setAvailableTables([]);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      setError('');
      try {
        const res = await reservationApi.getAvailability(
          form.date,
          form.timeSlot,
          form.guestCount
        );
        setAvailableTables(res.data);
        if (form.tableId && !res.data.some((t) => t._id === form.tableId)) {
          setForm((prev) => ({ ...prev, tableId: '' }));
        }
      } catch (err) {
        setAvailableTables([]);
        setError(err.message);
      } finally {
        setChecking(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [form.date, form.timeSlot, form.guestCount, form.tableId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        date: form.date,
        timeSlot: form.timeSlot,
        guestCount: Number(form.guestCount),
        notes: form.notes,
      };
      if (form.tableId) {
        payload.tableId = form.tableId;
      }

      await reservationApi.create(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Book a Table</h2>
      </div>

      <div className="card form-card">
        <Alert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Date
              <input
                type="date"
                min={minDate}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>

            <label>
              Time Slot
              <select
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Number of Guests
              <input
                type="number"
                min={1}
                max={20}
                value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                required
              />
            </label>

            <label>
              Preferred Table (optional)
              <select
                value={form.tableId}
                onChange={(e) => setForm({ ...form, tableId: e.target.value })}
                disabled={!form.date || checking || availableTables.length === 0}
              >
                <option value="">Auto-assign best available</option>
                {availableTables.map((table) => (
                  <option key={table._id} value={table._id}>
                    Table {table.tableNumber} — seats {table.capacity}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Notes (optional)
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Special requests, allergies, etc."
            />
          </label>

          <div className="availability-box">
            {checking && <p>Checking availability...</p>}
            {!checking && form.date && availableTables.length > 0 && (
              <p className="text-success">
                {availableTables.length} table(s) available for your party.
              </p>
            )}
            {!checking && form.date && availableTables.length === 0 && (
              <p className="text-error">No tables available for this selection.</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !form.date || availableTables.length === 0}
          >
            {loading ? 'Booking...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
