import React, { useState, useEffect } from 'react';
import { getDashboard, getRevenue, getTopItems } from '../services/api';

function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue]     = useState(null);
  const [topItems, setTopItems]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const [dashRes, topRes] = await Promise.all([
        getDashboard(),
        getTopItems()
      ]);
      setDashboard(dashRes.data.data);
      setTopItems(topRes.data.data);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevenueSearch(e) {
    e.preventDefault();
    try {
      const res = await getRevenue(from, to);
      setRevenue(res.data.data);
    } catch (err) {
      setError('Failed to load revenue data');
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error)   return <div className="container"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Reports 📈</h1>
      </div>

      {/* Summary cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem'}}>
        <div className="card" style={{textAlign:'center'}}>
          <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>TODAY'S ORDERS</p>
          <h2 style={{fontSize:'2rem', color:'#6366f1'}}>{dashboard.today.total_orders}</h2>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>TODAY'S REVENUE</p>
          <h2 style={{fontSize:'2rem', color:'#22c55e'}}>₹{dashboard.today.total_revenue || 0}</h2>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'8px'}}>MONTHLY REVENUE</p>
          <h2 style={{fontSize:'2rem', color:'#f59e0b'}}>₹{dashboard.monthly_revenue || 0}</h2>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'2rem'}}>

        {/* Top selling items */}
        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>🔥 Top Selling Items</h3>
          {topItems.length === 0 ? (
            <p style={{color:'#64748b'}}>No orders yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, i) => (
                  <tr key={i}>
                    <td><strong>{item.name}</strong></td>
                    <td style={{color:'#64748b'}}>{item.category}</td>
                    <td>{item.total_ordered}</td>
                    <td>₹{item.total_revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Orders by status */}
        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>📊 Orders by Status</h3>
          {dashboard.orders_by_status.length === 0 ? (
            <p style={{color:'#64748b'}}>No orders yet</p>
          ) : (
            dashboard.orders_by_status.map(o => (
              <div key={o.status} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #e2e8f0'}}>
                <span className={`badge badge-${o.status}`}>{o.status}</span>
                <strong>{o.count} orders</strong>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revenue by date range */}
      <div className="card">
        <h3 style={{marginBottom:'1rem'}}>💰 Revenue by Date Range</h3>
        <form onSubmit={handleRevenueSearch} style={{display:'flex', gap:'1rem', alignItems:'flex-end', marginBottom:'1rem'}}>
          <div className="form-group" style={{margin:0}}>
            <label>From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} required/>
          </div>
          <div className="form-group" style={{margin:0}}>
            <label>To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} required/>
          </div>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        {revenue && (
          <>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
              <div style={{padding:'1rem', background:'#f8fafc', borderRadius:'8px', textAlign:'center'}}>
                <p style={{color:'#64748b', fontSize:'0.8rem'}}>TOTAL ORDERS</p>
                <h3 style={{color:'#6366f1'}}>{revenue.summary.total_orders}</h3>
              </div>
              <div style={{padding:'1rem', background:'#f8fafc', borderRadius:'8px', textAlign:'center'}}>
                <p style={{color:'#64748b', fontSize:'0.8rem'}}>TOTAL REVENUE</p>
                <h3 style={{color:'#22c55e'}}>₹{revenue.summary.total_revenue || 0}</h3>
              </div>
            </div>

            {revenue.daily.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.daily.map((day, i) => (
                    <tr key={i}>
                      <td>{new Date(day.date).toLocaleDateString()}</td>
                      <td>{day.total_orders}</td>
                      <td>₹{day.total_revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{color:'#64748b'}}>No paid orders in this date range</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;