import axiosInstance from './axiosInstance';

export const uploadImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};