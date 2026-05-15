import axiosInstance from './axiosInstance';

export const getActiveBanners = () => axiosInstance.get('/banners/active');
export const getAllBanners = (params) => axiosInstance.get('/banners', { params });
export const createBanner = (data) => axiosInstance.post('/banners', data);
export const updateBanner = (id, data) => axiosInstance.put(`/banners/${id}`, data);
export const toggleBanner = (id) => axiosInstance.patch(`/banners/${id}/toggle`);
export const deleteBanner = (id) => axiosInstance.delete(`/banners/${id}`);