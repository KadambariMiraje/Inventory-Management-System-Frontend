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
  login:    (data) => api.post('/user/login', data),
};

// Products
export const productAPI = {
  getAll:           ()           => api.get('/product'),
  getById:          (id)         => api.get(`/product/${id}`),
  addProduct:       (data)       => api.post('/product/addproduct', data),
  update:           (id, d)      => api.put(`/product/${id}`, d),
  getCategories:    ()           => api.get('/product/getcategory'),
  getByCategory:    (cat)        => api.post(`/product/getproductname/${encodeURIComponent(cat)}`),
  getLowStock:      ()           => api.get('/product/lowstockitems'),
  getAllWithBatches: ()           => api.get('/product/allproducts'),
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

// Transactions
export const transactionAPI = {
  getAll: (params) => api.get('/transaction/alltransactions', { params }),
  sale:   (data)   => api.post('/product/sale', data),
};

export default api;