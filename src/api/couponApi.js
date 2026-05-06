import axiosInstance from './axiosInstance';

export const validateCoupon = (code, userId) =>
    axiosInstance.post('/coupons/validate', { code }, { params: { userId } });