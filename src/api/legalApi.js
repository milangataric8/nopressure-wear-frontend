import axiosInstance from './axiosInstance';

export const getLegalContent = (type, lang) =>
    axiosInstance.get(`/legal/${type}`, { params: { lang } });

export const updateLegalContent = (type, lang, content) =>
    axiosInstance.put(`/legal/${type}`, { language: lang, content });
