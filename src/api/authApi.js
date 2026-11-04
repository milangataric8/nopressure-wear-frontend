import axiosInstance from './axiosInstance';
import i18n from '../i18n/i18n';

export const login = (data) => axiosInstance.post('/auth/login', data);
export const register = (data) => axiosInstance.post('/auth/register', data, { params: { lang: i18n.resolvedLanguage || 'sr' } });
export const forgotPassword = (email) =>
    axiosInstance.post('/auth/forgot-password', { email }, { params: { lang: i18n.resolvedLanguage || 'sr' } });

export const verifyEmail = (token) =>
    axiosInstance.get('/auth/verify-email', { params: { token } });

export const resendVerification = (email) =>
    axiosInstance.post('/auth/resend-verification', { email }, { params: { lang: i18n.resolvedLanguage || 'sr' } });