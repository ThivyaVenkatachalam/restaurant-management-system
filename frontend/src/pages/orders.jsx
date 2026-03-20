import React, { useState, useEffect } from 'react';
import { getOrders, getMenuItems, getTables, createOrder, updateOrderStatus } from '../services/api';

function Orders() {
  const [orders, setOrders]     = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [orderItems, setOrderItems]       = useState([{ menu_item_id: '', quantity: 1 }]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersRes, menuRes, tablesRes] = await Promise.all([
        getOrders(),
        getMenuItems(),
        getTables()
      ]);
      setOrders(ordersRes.data.data);
      setMenuItems(menuRes.data.data);
      setTables(tablesRes.data.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setOrderItems([...orderItems, { menu_item_id: '', quantity: 1 }]);
  }

  function removeItem(index) {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  }

  function calculateTotal() {
    return orderItems.reduce((total, item) => {
      const menuItem = menuItems.find(m => m.id === parseInt(item.menu_item_id));
      if (menuItem && item.quantity) {
        return total + (menuItem.price * item.quantity);
      }
      return total;
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const validItems = orderItems.filter(i => i.menu_item_id && i.quantity > 0);
      if (validItems.length === 0) {
        setError('Add at least one item!');
        return;
      }

      await createOrder({
        table_id: selectedTable,
        items:    validItems.map(i => ({
          menu_item_id: parseInt(i.menu_item_id),
          quantity:     parseInt(i.quantity)
        }))
      });

      setSuccess('Order created successfully!');
      setShowForm(false);
      setSelectedTable('');
      setOrderItems([{ menu_item_id: '', quantity: 1 }]);
      loadData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await updateOrderStatus(id, { status });
      setSuccess(`Order marked as ${status}!`);
      loadData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update status');
    }
  }

  const nextStatus = {
    pending:   'preparing',
    preparing: 'served',
    served:    'paid'
  };

  const statusColor = {
    pending:   'btn-warning',
    preparing: 'btn-primary',
    served:    'btn-success',
    paid:      'btn-outline'
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Orders 📋</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + New Order
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Create order form */}
      {showForm && (
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem'}}>Create New Order</h3>
          <form onSubmit={handleSubmit}>

            {/* Table selection */}
            <div className="form-group" style={{marginBottom:'1rem'}}>
              <label>Select Table</label>
              <select
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
                required
              >
                <option value="">Choose a table</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>
                    Table {t.number} (Capacity: {t.capacity}) — {t.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Order items */}
            <label style={{fontSize:'0.8rem',fontWeight:'500',color:'#64748b',textTransform:'uppercase'}}>
              Items
            </label>
            {orderItems.map((item, index) => (
              <div key={index} style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:'0.5rem', marginBottom:'0.5rem', marginTop:'0.5rem'}}>
                <select
                  value={item.menu_item_id}
                  onChange={e => updateItem(index, 'menu_item_id', e.target.value)}
                  required
                >
                  <option value="">Select item</option>
                  {menuItems.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} — ₹{m.price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => updateItem(index, 'quantity', e.target.value)}
                  style={{width:'70px'}}
                />
                {orderItems.length > 1 && (
                  <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>✕</button>
                )}
              </div>
            ))}

            {/* Total */}
            <div style={{margin:'1rem 0', padding:'10px', background:'#f8fafc', borderRadius:'8px'}}>
              <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
            </div>

            <div style={{display:'flex', gap:'0.5rem'}}>
              <button type="button" className="btn btn-outline" onClick={addItem}>+ Add Item</button>
              <button type="submit" className="btn btn-primary">Place Order</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Orders list */}
      <div className="card" style={{padding:0}}>
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Table</th>
              <th>Staff</th>
              <th>Total</th>
              <th>Status</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign:'center', color:'#64748b', padding:'2rem'}}>
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td><strong>#{order.id}</strong></td>
                  <td>Table {order.table_number}</td>
                  <td>{order.staff_name}</td>
                  <td>₹{order.total}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{color:'#64748b', fontSize:'0.8rem'}}>
                    {new Date(order.created_at).toLocaleTimeString()}
                  </td>
                  <td>
                    {nextStatus[order.status] && (
                      <button
                        className={`btn ${statusColor[order.status]}`}
                        style={{fontSize:'0.75rem'}}
                        onClick={() => handleStatusChange(order.id, nextStatus[order.status])}
                      >
                        Mark {nextStatus[order.status]}
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <span style={{color:'#22c55e', fontSize:'0.85rem'}}>✅ Paid</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;