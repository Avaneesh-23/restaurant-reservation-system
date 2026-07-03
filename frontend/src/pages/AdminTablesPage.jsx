import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { tableApi } from '../services/api';

export default function AdminTablesPage() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ tableNumber: '', capacity: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTables = async () => {
    try {
      const res = await tableApi.getAll();
      setTables(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await tableApi.create({
        tableNumber: Number(form.tableNumber),
        capacity: Number(form.capacity),
      });
      setSuccess('Table added successfully.');
      setForm({ tableNumber: '', capacity: '' });
      loadTables();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (table) => {
    try {
      await tableApi.update(table._id, { isActive: !table.isActive });
      loadTables();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return;

    try {
      await tableApi.remove(id);
      setSuccess('Table deleted.');
      loadTables();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h2>Manage Tables</h2>
      </div>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card form-card">
        <h3>Add New Table</h3>
        <form className="inline-form" onSubmit={handleCreate}>
          <label>
            Table #
            <input
              type="number"
              min={1}
              value={form.tableNumber}
              onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
              required
            />
          </label>
          <label>
            Capacity
            <input
              type="number"
              min={1}
              max={20}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Add Table
          </button>
        </form>
      </div>

      {loading ? (
        <p>Loading tables...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Table #</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table._id}>
                  <td>{table.tableNumber}</td>
                  <td>{table.capacity}</td>
                  <td>
                    <span className={`status status-${table.isActive ? 'confirmed' : 'cancelled'}`}>
                      {table.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleActive(table)}
                    >
                      {table.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(table._id)}
                    >
                      Delete
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
