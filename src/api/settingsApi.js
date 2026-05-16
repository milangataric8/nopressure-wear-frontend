import axiosInstance from './axiosInstance';

export const getSettings = () => axiosInstance.get('/settings');
export const getSettingsMap = () => axiosInstance.get('/settings/map');
export const updateSettings = (id, value) => axiosInstance.put(`/settings/${id}`, { value });