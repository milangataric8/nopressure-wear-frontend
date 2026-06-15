import axiosInstance from './axiosInstance';

export const sendNotification = (data) =>
    axiosInstance.post('/notifications/notification', data);
export const getNotificationHistory = () =>
    axiosInstance.get('/notifications/history');
export const getChannelStatus = () =>
    axiosInstance.get('/notifications/channels');
export const deleteNotification = (id) =>
    axiosInstance.delete(`/notifications/${id}`);