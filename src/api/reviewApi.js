import axiosInstance from './axiosInstance';

export const getReviews = (productId) => axiosInstance.get(`/reviews/product/${productId}`);
export const addReview = (productId, userId, data) => axiosInstance.post(`/reviews/product/${productId}/user/${userId}`, data);
export const deleteReview = (reviewId, userId) => axiosInstance.delete(`/reviews/${reviewId}/user/${userId}`);