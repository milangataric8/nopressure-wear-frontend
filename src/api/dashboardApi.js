import axiosInstance from './axiosInstance';

export const getOverview = () =>
    axiosInstance.get('/dashboard/overview');
export const getRevenueByMonth = () =>
    axiosInstance.get('/dashboard/revenue-by-month');
export const getOrdersByStatus = () =>
    axiosInstance.get('/dashboard/orders-by-status');
export const getTopProducts = (limit = 5) =>
    axiosInstance.get('/dashboard/top-products', { params: { limit } });
export const getTopCustomers = (limit = 5) =>
    axiosInstance.get('/dashboard/top-customers', { params: { limit } });
export const getLowStock = (threshold = 10) =>
    axiosInstance.get('/dashboard/low-stock', { params: { threshold } });
export const getRevenueByCategory = () =>
    axiosInstance.get('/dashboard/revenue-by-category');
export const getPaymentStats = () =>
    axiosInstance.get('/dashboard/payment-stats');
export const getRecentOrders = (limit = 5) =>
    axiosInstance.get('/dashboard/recent-orders', { params: { limit } });