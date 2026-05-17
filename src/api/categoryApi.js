import axiosInstance from './axiosInstance';

export const getCategories = (params) => axiosInstance.get('/categories', { params });
export const createCategory = (data) => axiosInstance.post('/categories', data);
export const updateCategory = (id, data) => axiosInstance.put(`/categories/${id}`, data);
export const getActiveCategories = () => axiosInstance.get('/categories/active');