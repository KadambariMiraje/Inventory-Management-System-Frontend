import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://inventorymanagementsystem.duckdns.org';
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://10.29.70.131:8083/api';

const api = axios.create({ baseURL: BASE_URL });


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
 
export const authAPI = {
  register: (data) => api.post('/user/signup', data),
  login:    (data) => api.post('/user/login', data),
  sendOtp:       ()     => api.get('/user'),
  updateProfile:     (data) => api.put('/user', data),
  verifyPasswordOtp: (data) => api.post('/user/otp', data),
  updatePassword:    (data) => api.put('/user/password', data),
  forgotByUsername: (username) => api.get(`/user/username/otp/${username}`),
  forgotByEmail:    (email)    => api.get(`/user/email/otp/${email}`),
  resetPasswordByUsername:    (data)     => api.put('/user/username', data),
  resetPasswordByEmail:    (data)     => api.put('/user/email', data),
};

export const productAPI = {
  addProduct:       (data)       => api.post('/product', data),
  getCategories:    ()           => api.get('/product/categories'),
  getByCategory:    (cat)        => api.get(`/product/${encodeURIComponent(cat)}`),
  getLowStock:      ()           => api.get('/product/lowstockitems'),
  getAllWithBatches: ()           => api.get('/product'),
  getProductUnit: (name)          => api.get(`/product/unit/${encodeURIComponent(name)}`),
  editProduct:      (code, data) => api.put('/product', { productCode: code, ...data }),
  deleteProduct:    (code)       => api.delete(`/product/${code}`),
  generateProductCode: ()         => api.get('/product/generate-productcode'),
  checkProductCode:    (code)     => api.get(`/product/check-productcode/${encodeURIComponent(code)}`),
  generatePurchaseOrderCode: ()         => api.get('/product/generate-batchcode'),
  checkPurchaseOrderCode:    (code)     => api.get(`/product/check-batchcode/${encodeURIComponent(code)}`),
};

export const batchAPI = {
  purchase:    (data)       => api.post('/product/batch', data),
  editBatch:   (id, data)   => api.put('/product/batch', { id, ...data }),
  deleteBatch: (id)         => api.delete(`/product/batch/${id}`),
  getExpiring: ()       => api.get('/product/expiryitems'),
};

export const staffAPI = {
  add:    (data)     => api.post('/staff', data),
  getAll: ()         => api.get('/staff'),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const transactionAPI = {
  getAll: () => api.get('/transaction'),
  sale:   (data)   => api.post('/product/sale', data),
};

export default api;