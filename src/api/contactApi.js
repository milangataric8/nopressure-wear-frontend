import axiosInstance from './axiosInstance';

export const sendContactMessage = (data, lang = 'en') =>
    axiosInstance.post(`/contact?lang=${lang}`, data);