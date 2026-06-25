import axiosInstance from './axiosInstance';
import i18n from '../i18n/i18n';

export const checkout = (userId, couponCode, paymentMethod) =>
    axiosInstance.post(`/orders/${userId}/checkout`, null, {
        params: {
            ...(couponCode ? { couponCode } : {}),
            ...(paymentMethod ? { paymentMethod } : {}),
            lang: i18n.language
        }
    });
export const guestCheckout = (data) =>
    axiosInstance.post('/orders/guest-checkout', data, { params: { lang: i18n.language } });
export const getOrders = (userId, params) =>
    axiosInstance.get(`/orders/${userId}`, { params });
export const getOrderById = (userId, orderId) =>
    axiosInstance.get(`/orders/${userId}/${orderId}`);
export const updateOrderStatus = (orderId, status) =>
    axiosInstance.patch(`/orders/${orderId}/status`, null, { params: { status, lang: i18n.language } });
export const getOrdersByAdmin =  (params) => axiosInstance.get('/orders/all', { params });
export const getOrderByIdAdmin = (orderId) =>
    axiosInstance.get(`/orders/admin/${orderId}`);
