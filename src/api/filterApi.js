import axiosInstance from './axiosInstance';

export const createFilter = (data) => axiosInstance.post('/filters', data);
export const deleteFilter = (id) => axiosInstance.delete(`/filters/${id}`);
export const getVisibleFilters = () => axiosInstance.get('/filters/visible');
export const getAllFilters = () => axiosInstance.get('/filters');
export const updateFilter = (id, data) => axiosInstance.put(`/filters/${id}`, data);