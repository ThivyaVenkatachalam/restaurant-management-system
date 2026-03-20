import React, { useState, useEffect } from 'react';
import { getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';

function Menu() {
  const [items, setItems]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const emptyForm = { category_id: '', name: '', description: '', price: '', is_available: true };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [menuRes, catRes] = await Promise.all([
        getMenuItems(),
        getCategories()
      ]);
      setItems(menuRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  function handleEdit(item) {
    setEditItem(item);
    setForm({
      category_id:  item.category_id,
      name:         item.name,
      description:  item.description,
      price:        item.price,
      is_available: item.is_available
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditItem(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editItem) {
        await updateMenuItem(editItem.id, form);
        setSuccess('Menu item updated!');
      } else {
        await createMenuItem(form);
        setSuccess('Menu item created!');
      }
      handleCancel();
      loadData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      loadData();
    } catch (err) {
      setError('Failed to delete item');
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Menu 🍴</h1>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Item
          </button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem'}}>{editItem ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              <div className="form-group">
                <label>Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required/>
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required/>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" name="description" value={form.description} onChange={handleChange}/>
              </div>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange}/>
                {' '} Available
              </label>
            </div>
            <div style={{display:'flex', gap:'0.5rem'}}>
              <button className="btn btn-primary" type="submit">{editItem ? 'Update' : 'Create'}</button>
              <button className="btn btn-outline" type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Menu items grouped by category */}
      {categories.map(cat => {
        const catItems = items.filter(i => i.category_id === cat.id);
        if (catItems.length === 0) return null;
        return (
          <div key={cat.id} style={{marginBottom:'2rem'}}>
            <h2 style={{marginBottom:'1rem', color:'#64748b', fontSize:'1rem', textTransform:'uppercase'}}>{cat.name}</h2>
            <div className="card" style={{padding:0}}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Available</th>
                    {user.role === 'admin' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {catItems.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td style={{color:'#64748b'}}>{item.description}</td>
                      <td>₹{item.price}</td>
                      <td>
                        <span className={`badge ${item.is_available ? 'badge-available' : 'badge-occupied'}`}>
                          {item.is_available ? 'Yes' : 'No'}
                        </span>
                      </td>
                      {user.role === 'admin' && (
                        <td>
                          <button className="btn btn-warning" style={{marginRight:'0.5rem'}} onClick={() => handleEdit(item)}>Edit</button>
                          <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="card" style={{textAlign:'center', padding:'3rem', color:'#64748b'}}>
          <p>No menu items yet.</p>
          {user.role === 'admin' && <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={() => setShowForm(true)}>Add First Item</button>}
        </div>
      )}
    </div>
  );
}

export default Menu;