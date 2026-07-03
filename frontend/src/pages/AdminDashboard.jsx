import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { reservationApi, TIME_SLOTS } from '../services/api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationApi.getAll(filterDate || undefined);
      setReservations(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [filterDate]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;

    try {
      await reservationApi.cancel(id);
      setSuccess('Reservation cancelled.');
      loadReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (reservation) => {
    setEditing(reservation._id);
    setEditForm({
      date: reservation.date.split('T')[0],
      timeSlot: reservation.timeSlot,
      guestCount: reservation.guestCount,
      notes: reservation.notes || '',
    });
  };

  const handleUpdate = async (id) => {
    try {
      await reservationApi.update(id, {
        ...editForm,
        guestCount: Number(editForm.guestCount),
      });
      setSuccess('Reservation updated.');
      setEditing(null);
      loadReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h2>All Reservations</h2>
        <label className="inline-filter">
          Filter by date
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilterDate('')}>
              Clear
            </button>
          )}
        </label>
      </div>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <p>Loading reservations...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Date</th>
                <th>Time</th>
                <th>Guests</th>
                <th>Table</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div>{r.user?.name}</div>
                    <small>{r.user?.email}</small>
                  </td>
                  <td>
                    {editing === r._id ? (
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      />
                    ) : (
                      formatDate(r.date)
                    )}
                  </td>
                  <td>
                    {editing === r._id ? (
                      <select
                        value={editForm.timeSlot}
                        onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    ) : (
                      r.timeSlot
                    )}
                  </td>
                  <td>
                    {editing === r._id ? (
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={editForm.guestCount}
                        onChange={(e) => setEditForm({ ...editForm, guestCount: e.target.value })}
                      />
                    ) : (
                      r.guestCount
                    )}
                  </td>
                  <td>
                    Table {r.table?.tableNumber} (seats {r.table?.capacity})
                  </td>
                  <td>
                    <span className={`status status-${r.status}`}>{r.status}</span>
                  </td>
                  <td className="actions-cell">
                    {r.status === 'confirmed' && editing !== r._id && (
                      <>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(r)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(r._id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {editing === r._id && (
                      <>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => handleUpdate(r._id)}>
                          Save
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
                          Close
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reservations.length === 0 && <p className="empty-inline">No reservations found.</p>}
        </div>
      )}
    </div>
  );
}
