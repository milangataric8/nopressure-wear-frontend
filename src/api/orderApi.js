import axiosInstance from './axiosInstance';

export const checkout = (userId, couponCode) =>
    axiosInstance.post(`/orders/${userId}/checkout`, null, { params: couponCode ? { couponCode } : {} });
export const getOrders = (userId, params) =>
    axiosInstance.get(`/orders/${userId}`, { params });
export const getOrderById = (userId, orderId) =>
    axiosInstance.get(`/orders/${userId}/${orderId}`);
export const updateOrderStatus = (orderId, status) =>
    axiosInstance.patch(`/orders/${orderId}/status`, null, { params: { status } });
export const getOrdersByAdmin =  (params) => axiosInstance.get('/orders/all', { params });
export const getOrderByIdAdmin = (orderId) =>
    axiosInstance.get(`/orders/admin/${orderId}`);
