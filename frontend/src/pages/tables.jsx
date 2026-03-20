import React, { useState, useEffect } from 'react';
import { getTables, createTable, updateTableStatus, deleteTable } from '../services/api';

function Tables() {
  const [tables, setTables]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [form, setForm]         = useState({ number: '', capacity: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    try {
      const res = await getTables();
      setTables(res.data.data);
    } catch (err) {
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createTable(form);
      setSuccess('Table created!');
      setShowForm(false);
      setForm({ number: '', capacity: '' });
      loadTables();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create table');
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await updateTableStatus(id, { status });
      loadTables();
    } catch (err) {
      setError('Failed to update status');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this table?')) return;
    try {
      await deleteTable(id);
      loadTables();
    } catch (err) {
      setError('Failed to delete table');
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Tables 🪑</h1>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + Add Table
          </button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Add table form */}
      {showForm && (
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem'}}>Add New Table</h3>
          <form onSubmit={handleCreate}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              <div className="form-group">
                <label>Table Number</label>
                <input
                  type="number"
                  name="number"
                  value={form.number}
                  onChange={e => setForm({...form, number: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={e => setForm({...form, capacity: e.target.value})}
                  required
                />
              </div>
            </div>
            <div style={{display:'flex', gap:'0.5rem'}}>
              <button className="btn btn-primary" type="submit">Create</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tables grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem'}}>
        {tables.map(table => (
          <div key={table.id} className="card" style={{textAlign:'center'}}>
            <h2 style={{fontSize:'2rem', marginBottom:'8px'}}>🪑</h2>
            <h3 style={{marginBottom:'4px'}}>Table {table.number}</h3>
            <p style={{color:'#64748b', fontSize:'0.85rem', marginBottom:'1rem'}}>
              Capacity: {table.capacity}
            </p>
            <span className={`badge badge-${table.status}`} style={{marginBottom:'1rem', display:'block'}}>
              {table.status}
            </span>

            {/* Status change buttons */}
            <div style={{display:'flex', flexDirection:'column', gap:'0.4rem'}}>
              {table.status !== 'available' && (
                <button className="btn btn-success" style={{fontSize:'0.75rem'}} onClick={() => handleStatusChange(table.id, 'available')}>
                  Set Available
                </button>
              )}
              {table.status !== 'occupied' && (
                <button className="btn btn-warning" style={{fontSize:'0.75rem'}} onClick={() => handleStatusChange(table.id, 'occupied')}>
                  Set Occupied
                </button>
              )}
              {table.status !== 'reserved' && (
                <button className="btn btn-outline" style={{fontSize:'0.75rem'}} onClick={() => handleStatusChange(table.id, 'reserved')}>
                  Set Reserved
                </button>
              )}
              {user.role === 'admin' && (
                <button className="btn btn-danger" style={{fontSize:'0.75rem'}} onClick={() => handleDelete(table.id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="card" style={{textAlign:'center', padding:'3rem', color:'#64748b'}}>
          <p>No tables yet.</p>
          {user.role === 'admin' && (
            <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={() => setShowForm(true)}>
              Add First Table
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Tables;