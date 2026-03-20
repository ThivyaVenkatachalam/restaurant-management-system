import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
  const navigate        = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="form-card">
      <h2 style={{marginBottom:'1.5rem'}}>🍽️ Restaurant MS</h2>
      <h3 style={{marginBottom:'1.5rem'}}>Login</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@email.com"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••"
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary" type="submit" style={{width:'100%',marginTop:'1rem'}}>
          Login
        </button>
      </form>

      <p style={{textAlign:'center',marginTop:'1rem',fontSize:'0.875rem'}}>
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;