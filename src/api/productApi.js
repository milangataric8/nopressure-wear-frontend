import axiosInstance from './axiosInstance';

export const getProducts = (params) =>
    axiosInstance.get('/products', { params });
export const getActiveProducts = (params) =>
    axiosInstance.get('/products/active', { params });
export const getProductById = (id) =>
    axiosInstance.get(`/products/${id}`);
export const searchActiveProducts = (params) =>
    axiosInstance.get('/products/search', { params });
export const getProductFilters = () =>
    axiosInstance.get('/products/filters');
export const createProduct = (data) =>
    axiosInstance.post('/products', data);
export const updateProduct = (id, data) =>
    axiosInstance.put(`/products/${id}`, data);
export const deleteProduct = (id) =>
    axiosInstance.delete(`/products/${id}`);
export const activateDeactivateProduct = (id) =>
    axiosInstance.patch(`/products/${id}/toggle`);
export const addProductImage = (productId, data) =>
    axiosInstance.post(`/products/${productId}/images`, data);
export const deleteProductImage = (imageId) =>
    axiosInstance.delete(`/products/images/${imageId}`);
export const getSimilarProducts = (productId, limit = 4) =>
    axiosInstance.get(`/products/${productId}/similar`, { params: { limit } });
export const getColorVariants = (productId) =>
    axiosInstance.get(`/products/${productId}/variants`);
export const linkColorVariant = (productId, variantProductId) =>
    axiosInstance.post(`/products/${productId}/variants/${variantProductId}`);
export const unlinkColorVariant = (productId, variantProductId) =>
    axiosInstance.delete(`/products/${productId}/variants/${variantProductId}`);