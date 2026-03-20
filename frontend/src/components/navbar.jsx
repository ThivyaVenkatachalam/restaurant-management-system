import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <span className="logo">🍽️ Restaurant MS</span>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/tables">Tables</Link>
        <Link to="/orders">Orders</Link>
        {user.role === 'admin' && <Link to="/reports">Reports</Link>}
        <span style={{color:'#cbd5e1'}}>Hi, {user.name}</span>
        <button className="btn btn-outline" onClick={logout} style={{color:'#fff'}}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;