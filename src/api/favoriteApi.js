import axiosInstance from './axiosInstance';

export const getUserFavorites = (userId) => axiosInstance.get(`/favorites/${userId}`);
export const getFavoriteCount = (userId) => axiosInstance.get(`/favorites/${userId}/count`);
export const checkFavorite = (userId, productId) => axiosInstance.get(`/favorites/${userId}/check/${productId}`);
export const toggleFavorite = (userId, productId) => axiosInstance.post(`/favorites/${userId}/toggle/${productId}`);