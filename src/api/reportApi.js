import axiosInstance from './axiosInstance';
import i18n from '../i18n/i18n';

const downloadFile = (url, filename) => {
    const lang = i18n.language || 'en';
    const separator = url.includes('?') ? '&' : '?';
    return axiosInstance.get(`${url}${separator}lang=${lang}`, { responseType: 'blob' })
        .then(response => {
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        });
};

export const downloadOrdersPdf = () =>
    downloadFile('/reports/orders/pdf', 'orders-report.pdf');
export const downloadOrdersExcel = () =>
    ('/reports/orders/excel', 'orders-report.xlsx');
export const downloadProductsPdf = () =>
    downloadFile('/reports/products/pdf', 'products-report.pdf');
export const downloadProductsExcel = () =>
    downloadFile('/reports/products/excel', 'products-report.xlsx');
export const downloadCustomersPdf = () =>
    downloadFile('/reports/customers/pdf', 'customers-report.pdf');
export const downloadCustomersExcel = () =>
    downloadFile('/reports/customers/excel', 'customers-report.xlsx');
export const downloadLowStockPdf = (threshold = 10) =>
    downloadFile(`/reports/low-stock/pdf?threshold=${threshold}`, 'low-stock-report.pdf');
export const downloadLowStockExcel = (threshold = 10) =>
    downloadFile(`/reports/low-stock/excel?threshold=${threshold}`, 'low-stock-report.xlsx');