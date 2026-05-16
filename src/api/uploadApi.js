import axiosInstance from './axiosInstance';

export const uploadImage = (file, removeBackground = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/upload/image?removeBackground=${removeBackground}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const uploadVideo = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};