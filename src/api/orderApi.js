import axiosInstance from './axiosInstance';

export const checkout = (userId) => axiosInstance.post(`/orders/${userId}/checkout`);
export const getOrders = (userId) => axiosInstance.get(`/orders/${userId}`);
export const getOrderById = (userId, orderId) =>
    axiosInstance.get(`/orders/${userId}/${orderId}`);
export const updateOrderStatus = (orderId, status) =>
    axiosInstance.patch(`/orders/${orderId}/status`, null, { params: { status } });