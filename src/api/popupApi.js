import axiosInstance from './axiosInstance';

export const getActivePopup = () => axiosInstance.get('/popups/active');
export const getAllPopups = () => axiosInstance.get('/popups');
export const createPopup = (data) => axiosInstance.post('/popups', data);
export const updatePopup = (id, data) => axiosInstance.put(`/popups/${id}`, data);
export const togglePopup = (id) => axiosInstance.patch(`/popups/${id}/toggle`);
export const deletePopup = (id) => axiosInstance.delete(`/popups/${id}`);