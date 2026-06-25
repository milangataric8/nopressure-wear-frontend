import axiosInstance from './axiosInstance';
import i18n from '../i18n/i18n';

export const login = (data) => axiosInstance.post('/auth/login', data);
export const register = (data) => axiosInstance.post('/auth/register', data);
export const forgotPassword = (email) =>
    axiosInstance.post('/auth/forgot-password', { email }, { params: { lang: i18n.language } });