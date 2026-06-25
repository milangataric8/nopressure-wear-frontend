import axiosInstance from './axiosInstance';
import i18n from '../i18n/i18n';

export const sendNotification = (data) =>
    axiosInstance.post('/notifications/notification', data, { params: { lang: i18n.language } });
export const getNotificationHistory = () =>
    axiosInstance.get('/notifications/history');
export const getChannelStatus = () =>
    axiosInstance.get('/notifications/channels');
export const deleteNotification = (id) =>
    axiosInstance.delete(`/notifications/${id}`);