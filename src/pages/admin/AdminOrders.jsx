import {useNavigate} from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {getOrdersByAdmin, updateOrderStatus} from '../../api/orderApi';
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import ResponsiveTable from "../../components/admin/ResponsiveTable.jsx";
import { useTranslation } from 'react-i18next';
import {useCurrency} from "../../context/CurrencyContext.jsx";

const AdminOrders = () => {
    const { t } = useTranslation();
    const { format } = useCurrency();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchAllOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 10, sort: 'createdAt,desc' };
            if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery;
            if (statusFilter && statusFilter.trim() !== '') params.status = statusFilter;

            const response = await getOrdersByAdmin(params);
            setOrders(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, statusFilter, t]);

    useEffect(() => {
        void fetchAllOrders();
    }, [fetchAllOrders]);

    const handleStatusUpdate = async (orderId, status) => {
        try {
            await updateOrderStatus(orderId, status);
            toast.success(t('messages.orderUpdated'));
            fetchAllOrders();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
        }
    };

    const getStatusLabel = (status) => ({
        PENDING: t('order.pending'),
        CONFIRMED: t('order.confirmed'),
        SHIPPED: t('order.shipped'),
        DELIVERED: t('order.delivered'),
        CANCELLED: t('order.cancelled'),
    }[status] || status);

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

    const statusSelect = (order) => (
        <select
            value={order.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, e.target.value); }}
            className="text-xs border border-gray-300 px-2 py-1.5 focus:outline-none focus:border-black transition-colors"
        >
            <option value="PENDING">{t('order.pending')}</option>
            <option value="CONFIRMED">{t('order.confirmed')}</option>
            <option value="SHIPPED">{t('order.shipped')}</option>
            <option value="DELIVERED">{t('order.delivered')}</option>
            <option value="CANCELLED">{t('order.cancelled')}</option>
        </select>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    {t('admin.orders')}
                </h1>
                <p className="text-sm text-gray-500">{t('admin.manageOrders')}</p>
            </div>

            {/* Search */}
            <form
                onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(0); }}
                className="flex flex-col sm:flex-row gap-3 mb-6"
            >
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t('admin.searchOrders')}
                    className="flex-1 min-w-0 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button
                    type="submit"
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {t('admin.search')}
                </button>
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(0); }}
                        className="border border-gray-300 text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                        {t('common.clear')}
                    </button>
                )}
            </form>

            {/* Status filter */}
            <div className="flex border border-gray-200 mb-6 overflow-x-auto md:overflow-visible">
                {[
                    { label: t('order.pending'), value: 'PENDING', bg: 'bg-yellow-50', text: 'text-yellow-700', active: 'bg-yellow-100 text-yellow-800' },
                    { label: t('order.confirmed'), value: 'CONFIRMED', bg: 'bg-blue-50', text: 'text-blue-700', active: 'bg-blue-100 text-blue-800' },
                    { label: t('order.shipped'), value: 'SHIPPED', bg: 'bg-purple-50', text: 'text-purple-700', active: 'bg-purple-100 text-purple-800' },
                    { label: t('order.delivered'), value: 'DELIVERED', bg: 'bg-green-50', text: 'text-green-700', active: 'bg-green-100 text-green-800' },
                    { label: t('order.cancelled'), value: 'CANCELLED', bg: 'bg-red-50', text: 'text-red-700', active: 'bg-red-100 text-red-800' },
                ].map(status => (
                    <button
                        key={status.value}
                        onClick={() => {
                            setStatusFilter(prev => prev === status.value ? '' : status.value);
                            setPage(0);
                        }}
                        className={`flex-none md:flex-1 flex-shrink-0 whitespace-nowrap px-4 md:px-0 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors border-r border-gray-200 last:border-r-0 ${
                            statusFilter === status.value
                                ? status.active
                                : `${status.bg} ${status.text} hover:opacity-80`
                        }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <LoadingSpinner height="h-32" />
            ) : (
                <ResponsiveTable
                    rows={orders}
                    rowKey={(o) => o.id}
                    onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
                    emptyMessage={t('order.empty')}
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    columns={[
                        {
                            key: 'order',
                            label: t('admin.order'),
                            primary: true,
                            render: (o) => (
                                <>
                                    <span className="text-sm font-semibold text-black">{o.orderCode}</span>
                                    <span className="block text-xs font-normal text-gray-400">
                                        {new Date(o.createdAt).toLocaleDateString()}
                                    </span>
                                </>
                            ),
                        },
                        {
                            key: 'customer',
                            label: t('order.customer'),
                            render: (o) => <span className="text-sm text-gray-500">{o.customerFullName}</span>,
                        },
                        {
                            key: 'items',
                            label: t('order.items'),
                            render: (o) => (
                                <span className="text-sm text-gray-500">
                                    {t('admin.itemsCount', { count: o.orderItems?.length || 0 })}
                                </span>
                            ),
                        },
                        {
                            key: 'total',
                            label: t('cart.total'),
                            render: (o) => <span className="text-sm font-bold text-black">{format(o.totalAmount)}</span>,
                        },
                        {
                            key: 'status',
                            label: t('order.status'),
                            render: (o) => (
                                <span className={`inline-block whitespace-nowrap text-xs font-semibold uppercase px-2 py-1 ${getStatusStyle(o.status)}`}>
                                    {getStatusLabel(o.status)}
                                </span>
                            ),
                        },
                        {
                            key: 'updateStatus',
                            label: t('order.updateStatus'),
                            hideOnMobile: true,
                            render: (o) => statusSelect(o),
                        },
                    ]}
                    mobileExtra={(o) => (
                        <div>
                            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{t('order.updateStatus')}</p>
                            {statusSelect(o)}
                        </div>
                    )}
                />
            )}
        </div>
    );
};

export default AdminOrders;