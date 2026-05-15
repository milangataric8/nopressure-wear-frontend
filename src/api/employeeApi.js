import axiosInstance from './axiosInstance';

export const getEmployees = (params) => axiosInstance.get('/employees', { params });