import React, { useState, useEffect } from 'react';
import { getDashboard, getOrders, getTables } from '../services/api';

function Dashboard() {
  const [data, setData]       = useState(null);
  const [orders, setOrders]   = useState([]);
  const [tables, setTables]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role === 'admin') {
      loadAdminDashboard();
    } else {
      loadStaffDashboard();
    }
  }, []);

  async function loadAdminDashboard() {
    try {
      const res = await getDashboard();
      setData(res.data.data);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function loadStaffDashboard() {
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        getOrders(),
        getTables()
      ]);
      setOrders(ordersRes.data.data);
      setTables(tablesRes.data.data);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error)   return <div className="container"><div className="alert alert-error">{error}</div></div>;

  // ── Staff dashboard ───────────────────────────────────────
  if (user.role === 'staff') {
    const activeOrders = orders.filter(o => o.status !== 'paid');
    const availableTables = tables.filter(t => t.status === 'available');

    return (
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard 📋</h1>
          <span style={{color:'#64748b'}}>Welcome, {user.name}!</span>
        </div>

        {/* Staff stats */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem'}}>
          <div className="card" style={{textAlign:'center'}}>
            <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>ACTIVE ORDERS</p>
            <h2 style={{fontSize:'2rem', color:'#6366f1'}}>{activeOrders.length}</h2>
          </div>
          <div className="card" style={{textAlign:'center'}}>
            <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>AVAILABLE TABLES</p>
            <h2 style={{fontSize:'2rem', color:'#22c55e'}}>{availableTables.length}</h2>
          </div>
          <div className="card" style={{textAlign:'center'}}>
            <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>TOTAL TABLES</p>
            <h2 style={{fontSize:'2rem', color:'#f59e0b'}}>{tables.length}</h2>
          </div>
        </div>

        {/* Active orders */}
        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>Active Orders</h3>
          {activeOrders.length === 0 ? (
            <p style={{color:'#64748b'}}>No active orders!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Table</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>Table {order.table_number}</td>
                    <td>₹{order.total}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td style={{color:'#64748b', fontSize:'0.8rem'}}>
                      {new Date(order.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // ── Admin dashboard ───────────────────────────────────────
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Dashboard 📊</h1>
        <span style={{color:'#64748b'}}>Welcome back, {user.name}!</span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem'}}>
        <div className="card" style={{textAlign:'center'}}>
          <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>TODAY'S ORDERS</p>
          <h2 style={{fontSize:'2rem', color:'#6366f1'}}>{data.today.total_orders}</h2>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>TODAY'S REVENUE</p>
          <h2 style={{fontSize:'2rem', color:'#22c55e'}}>₹{data.today.total_revenue || 0}</h2>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>AVAILABLE TABLES</p>
          <h2 style={{fontSize:'2rem', color:'#f59e0b'}}>{data.tables.available}</h2>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>MONTHLY REVENUE</p>
          <h2 style={{fontSize:'2rem', color:'#6366f1'}}>₹{data.monthly_revenue || 0}</h2>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>Orders by Status</h3>
          {data.orders_by_status.length === 0 ? (
            <p style={{color:'#64748b'}}>No orders yet</p>
          ) : (
            data.orders_by_status.map(o => (
              <div key={o.status} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #e2e8f0'}}>
                <span className={`badge badge-${o.status}`}>{o.status}</span>
                <strong>{o.count}</strong>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>Top Selling Items 🔥</h3>
          {data.top_items.length === 0 ? (
            <p style={{color:'#64748b'}}>No orders yet</p>
          ) : (
            data.top_items.map((item, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #e2e8f0'}}>
                <span>{item.name}</span>
                <span style={{color:'#64748b'}}>{item.total_sold} sold</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>Table Status</h3>
          <div style={{display:'flex', gap:'1rem'}}>
            <div style={{textAlign:'center', flex:1}}>
              <p style={{color:'#64748b', fontSize:'0.8rem'}}>AVAILABLE</p>
              <h3 style={{color:'#22c55e'}}>{data.tables.available}</h3>
            </div>
            <div style={{textAlign:'center', flex:1}}>
              <p style={{color:'#64748b', fontSize:'0.8rem'}}>OCCUPIED</p>
              <h3 style={{color:'#ef4444'}}>{data.tables.occupied}</h3>
            </div>
            <div style={{textAlign:'center', flex:1}}>
              <p style={{color:'#64748b', fontSize:'0.8rem'}}>RESERVED</p>
              <h3 style={{color:'#f59e0b'}}>{data.tables.reserved}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;