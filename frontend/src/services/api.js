import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
});

// Automatically add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/login', data);

// Categories
export const getCategories    = ()     => API.get('/categories');
export const createCategory   = (data) => API.post('/categories', data);
export const deleteCategory   = (id)   => API.delete(`/categories/${id}`);

// Menu
export const getMenuItems     = ()     => API.get('/menu');
export const createMenuItem   = (data) => API.post('/menu', data);
export const updateMenuItem   = (id, data) => API.put(`/menu/${id}`, data);
export const deleteMenuItem   = (id)   => API.delete(`/menu/${id}`);

// Tables
export const getTables        = ()     => API.get('/tables');
export const getAvailableTables = ()   => API.get('/tables/available');
export const createTable      = (data) => API.post('/tables', data);
export const updateTableStatus = (id, data) => API.put(`/tables/${id}/status`, data);
export const deleteTable      = (id)   => API.delete(`/tables/${id}`);

// Orders
export const getOrders        = ()     => API.get('/orders');
export const getOrder         = (id)   => API.get(`/orders/${id}`);
export const createOrder      = (data) => API.post('/orders', data);
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);

// Reports
export const getDashboard     = ()           => API.get('/reports/dashboard');
export const getRevenue       = (from, to)   => API.get(`/reports/revenue?from=${from}&to=${to}`);
export const getTopItems      = ()           => API.get('/reports/top-items');