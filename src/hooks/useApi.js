import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://65.2.189.227:8083/api';
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.163:8083/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout when token expires (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login — works outside React components
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
 
// Auth
export const authAPI = {
  register: (data) => api.post('/user/signup', data),
  login:    (data) => api.post('/user/login', data),
  sendOtp:       ()     => api.get('/user/sendotp'),
  updateProfile:     (data) => api.post('/user/updateuser', data),
  verifyPasswordOtp: (data) => api.post('/user/verifypasswordforotp', data),
  updatePassword:    (data) => api.post('/user/updatepassword', data),

  forgotByUsername: (username) => api.get(`/user/forgetpassword/username/sendotp/${username}`),
  forgotByEmail:    (email)    => api.get(`/user/forgetpassword/email/sendotp/${email}`),
  resetPasswordByUsername:    (data)     => api.post('/user/forgetpassword/username/recoveraccount', data),
  resetPasswordByEmail:    (data)     => api.post('/user/forgetpassword/email/recoveraccount', data),
};

// Products
export const productAPI = {
  getAll:           ()           => api.get('/product'),
  getById:          (id)         => api.get(`/product/${id}`),
  addProduct:       (data)       => api.post('/product/addproduct', data),
  update:           (id, data)      => api.put(`/product/${id}`, data),
  getCategories:    ()           => api.get('/product/getcategory'),
  getByCategory:    (cat)        => api.post(`/product/getproductname/${encodeURIComponent(cat)}`),
  getLowStock:      ()           => api.get('/product/lowstockitems'),
  getAllWithBatches: ()           => api.get('/product/allproducts'),
  getProductUnit: (name)          => api.post(`/product/getunit/${encodeURIComponent(name)}`),
  editProduct:      (code, data) => api.put('/product/updateproduct', { productCode: code, ...data }),
  deleteProduct:    (code)       => api.delete(`/product/deleteproduct/${code}`),
};

// Batches / Purchase
export const batchAPI = {
  purchase:    (data)       => api.post('/product/addbatch', data),
  editBatch:   (id, data)   => api.put('/product/updatebatch', { id, ...data }),
  deleteBatch: (id)         => api.delete(`/product/deletebatch/${id}`),
  getExpiring: (days)       => api.get('/product/expiryitems'),
  getExpired:  ()           => api.get('/product/expiryitems'),
};

export const staffAPI = {
  add:    (data)     => api.post('/staff/addstaff', data),
  getAll: ()         => api.get('/staff/getstaff'),
  delete: (id) => api.delete(`/staff/deletestaff/${id}`),
};

// Transactions
export const transactionAPI = {
  getAll: (params) => api.get('/transaction/alltransactions', { params }),
  sale:   (data)   => api.post('/product/sale', data),
};

export default api;