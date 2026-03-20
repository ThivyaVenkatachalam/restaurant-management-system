import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login    from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import Menu     from './pages/menu';
import Tables   from './pages/tables';
import Orders   from './pages/orders';
import Reports  from './pages/report';
import Navbar   from './components/navbar';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/menu" element={
          <ProtectedRoute>
            <Navbar />
            <Menu />
          </ProtectedRoute>
        } />
        <Route path="/tables" element={
          <ProtectedRoute>
            <Navbar />
            <Tables />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Navbar />
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Navbar />
            <Reports />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;