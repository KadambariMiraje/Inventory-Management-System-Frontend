import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.155:8083/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  register: (data) => api.post('/user/signup', data),
  login:    (data) => api.post('/user/login',    data),
};

// Products
export const productAPI = {
  getAll:        ()       => api.get('/product'),
  getById:       (id)     => api.get(`/product/${id}`),
  addProduct:    (data)   => api.post('/product/addproduct', data),
  update:        (id, d)  => api.put(`/product/${id}`, d),
  getCategories: ()       => api.get('/product/getcategory'),
  getByCategory: (cat)    => api.post(`/product/getproductname/${encodeURIComponent(cat)}`),
  getLowStock:   ()       => api.get('/product/low-stock'),
};
 
// Batches / Purchase
export const batchAPI = {
  purchase:    (data) => api.post('/product/addbatch', data),
  getExpiring: (days) => api.get(`/batches/expiring?days=${days || 30}`),
  getExpired:  ()     => api.get('/batches/expired'),
};

// Transactions
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  sale:   (data)   => api.post('/sales', data),
};

export default api;