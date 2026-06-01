import axiosInstance from '../../api/axiosInstance';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from "../../components/common/Pagination.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useTranslation } from 'react-i18next';
import useFormatPrice from '../../hooks/useFormatPrice';

const AdminCustomerDetail = () => {
    const { t, i18n } = useTranslation();
    const formatPrice = useFormatPrice();
    const dateLocale = i18n.language === 'sr' ? 'sr-RS' : 'en-US';
    const getStatusLabel = (status) => ({
        PENDING: t('order.pending'),
        CONFIRMED: t('order.confirmed'),
        SHIPPED: t('order.shipped'),
        DELIVERED: t('order.delivered'),
        CANCELLED: t('order.cancelled'),
    }[status] || status);
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);

    const fetchCustomer = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/users/${customerId}`);
            setCustomer(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
            navigate('/admin/customers');
        } finally {
            setLoading(false);
        }
    }, [customerId, navigate]);

    const fetchOrders = useCallback(async () => {
        setOrdersLoading(true);
        try {
            const response = await axiosInstance.get(`/orders/user/${customerId}/all`, {
                params: { page, size: 10 }
            });
            setOrders(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalOrders(response.data.totalElements);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setOrdersLoading(false);
        }
    }, [customerId, page]);

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'SHIPPED': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    {loading && <LoadingSpinner />}
    {loading && <LoadingSpinner height="h-32" />}

    if (!customer) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <button
                onClick={() => navigate('/admin/customers')}
                className="text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-black transition-colors mb-8"
            >
                ← {t('admin.customers')}
            </button>

            {/* Customer info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        {customer.firstName} {customer.lastName}
                    </h1>
                    <p className="text-sm text-gray-500 mb-8">{customer.email}</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-gray-200 p-6 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                                {t('admin.totalOrders')}
                            </p>
                            <p className="text-3xl font-black text-black">{totalOrders}</p>
                        </div>
                        <div className="border border-gray-200 p-6 flex flex-col items-center justify-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                {t('order.status')}
                            </p>

                            <StatusBadge active={customer.active} />
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 p-6">
                    <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                        {t('admin.accountInfo')}
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">{t('auth.firstName')}</p>
                            <p className="text-sm font-medium text-black">{customer.firstName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">{t('auth.lastName')}</p>
                            <p className="text-sm font-medium text-black">{customer.lastName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">{t('auth.email')}</p>
                            <p className="text-sm font-medium text-black">{customer.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">{t('admin.memberSince')}</p>
                            <p className="text-sm font-medium text-black">
                                {new Date(customer.createdAt).toLocaleDateString(dateLocale, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders */}
            <div>
                <h2 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                    {t('admin.orders')}
                </h2>

                {ordersLoading && <LoadingSpinner />}
                {
                    ordersLoading && <LoadingSpinner height="h-32" />
                }
                { orders.length === 0 ? (
                    <div className="border border-gray-200 p-12 text-center">
                        <p className="text-sm text-gray-400">{t('order.empty')}</p>
                    </div>
                ) : (
                    <div className="border border-gray-200">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.order')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('order.date')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('order.items')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('cart.total')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('order.status')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map(order => (
                                <tr
                                    key={order.id}
                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-semibold text-black">
                                            {order.orderCode || `#${order.id}`}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString(dateLocale, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {t('admin.itemsCount', { count: order.orderItems?.length || 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-black">
                                        {formatPrice(order.totalAmount)}
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold uppercase px-2 py-1 ${getStatusStyle(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCustomerDetail;