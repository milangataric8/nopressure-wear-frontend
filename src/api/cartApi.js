import axiosInstance from './axiosInstance';

export const getCart = (userId) => axiosInstance.get(`/cart/${userId}`);
export const addToCart = (userId, data) => axiosInstance.post(`/cart/${userId}/items`, data);
export const updateCartItem = (userId, cartItemId, data) =>
    axiosInstance.put(`/cart/${userId}/items/${cartItemId}`, data);
export const removeCartItem = (userId, cartItemId) =>
    axiosInstance.delete(`/cart/${userId}/items/${cartItemId}`);
export const clearCart = (userId) => axiosInstance.delete(`/cart/${userId}/clear`);