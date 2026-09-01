import axios from 'axios';
import { toast } from 'react-toastify';
import { t } from 'i18next';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — adding JWT token for every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — 401 = expired/invalid session (log out); 403 = authenticated
// but not allowed (toast, stay put). Treating 403 like 401 would kick users out
// for clicking something they simply can't do.
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const isAuthEndpoint = error.config?.url?.startsWith('/auth/');

        if (status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (status === 403 && !isAuthEndpoint && !error.config?.skipForbiddenToast) {
            toast.error(t('messages.forbidden'));
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;