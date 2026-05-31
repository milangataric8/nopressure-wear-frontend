import axiosInstance from './axiosInstance';

export const getActiveStores = () => axiosInstance.get('/stores/active');
export const getAllStores = () => axiosInstance.get('/stores');
export const createStore = (data) => axiosInstance.post('/stores', data);
export const updateStore = (id, data) => axiosInstance.put(`/stores/${id}`, data);
export const toggleStore = (id) => axiosInstance.patch(`/stores/${id}/toggle`);
export const deleteStore = (id) => axiosInstance.delete(`/stores/${id}`);

// Product-Store
export const getStoresForProduct = (productId) => axiosInstance.get(`/stores/product/${productId}`);
export const getAllStoresForProduct = (productId) => axiosInstance.get(`/stores/product/${productId}/all`);
export const addProductToStore = (productId, data) => axiosInstance.post(`/stores/product/${productId}`, data);
export const toggleProductStoreStock = (id) => axiosInstance.patch(`/stores/product-store/${id}/toggle`);
export const removeProductFromStore = (productId, storeId) => axiosInstance.delete(`/stores/product/${productId}/store/${storeId}`);