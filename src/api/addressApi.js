import axiosInstance from './axiosInstance';

export const getAddresses = () =>
    axiosInstance.get('/addresses');
export const createAddress = (data) =>
    axiosInstance.post('/addresses', data);
export const getAddressByUser = (id) =>
    axiosInstance.get(`/addresses/user/${id}`);