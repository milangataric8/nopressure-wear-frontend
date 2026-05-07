import axiosInstance from './axiosInstance';

export const getProducts = (params) => axiosInstance.get('/products', { params });
export const getActiveProducts = (params) => axiosInstance.get('/products/active', { params });
export const getProductById = (id) => axiosInstance.get(`/products/${id}`);
export const getProductsByCategory = (id) => axiosInstance.get(`/products/category/${id}`);
export const getProductsByPriceRange = (minPrice, maxPrice, params) =>
    axiosInstance.get('/products/filter', { params: { minPrice, maxPrice, ...params } });
export const searchProducts = (query, params) =>
    axiosInstance.get('/products/search', { params: { query, ...params } });
export const createProduct = (data) => axiosInstance.post('/products', data);
export const updateProduct = (id, data) => axiosInstance.put(`/products/${id}`, data);
export const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`);
export const activateDeactivateProduct = (id) => axiosInstance.patch(`/products/${id}/toggle`);