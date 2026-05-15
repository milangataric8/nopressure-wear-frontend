import axiosInstance from './axiosInstance';

export const getCoupons = (params) => axiosInstance.get('/coupons', { params });
export const validateCoupon = (code, userId) =>
    axiosInstance.post('/coupons/validate', { code }, { params: { userId } });