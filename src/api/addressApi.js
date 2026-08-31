import axiosInstance from './axiosInstance';
export const createAddress = (data) =>
    axiosInstance.post('/addresses', data);
export const getAddressByUser = (id) =>
    axiosInstance.get(`/addresses/user/${id}`);