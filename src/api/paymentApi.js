import axiosInstance from './axiosInstance';

export const createPaymentIntent = (userId, couponCode) =>
    axiosInstance.post('/payments/create-payment-intent', { userId, couponCode });
export const getSavedCards = (userId) =>
    axiosInstance.get(`/payments/cards/${userId}`);
export const createSetupIntent = (userId) =>
    axiosInstance.post(`/payments/setup-intent/${userId}`);
export const deleteCard = (paymentMethodId) =>
    axiosInstance.delete(`/payments/cards/${paymentMethodId}`);