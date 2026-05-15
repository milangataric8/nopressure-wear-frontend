import axiosInstance from '../../api/axiosInstance';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminCustomerDetail = () => {
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
            toast.error('Failed to load customer, error: ' + e.message);
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
            toast.error('Failed to load orders, error: ' + e.message);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
            </div>
        );
    }

    if (!customer) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <button
                onClick={() => navigate('/admin/customers')}
                className="text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-black transition-colors mb-8"
            >
                ← Back to Customers
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
                                Total Orders
                            </p>
                            <p className="text-3xl font-black text-black">{totalOrders}</p>
                        </div>
                        <div className="border border-gray-200 p-6 flex flex-col items-center justify-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                Status
                            </p>
                            <span className={`text-xs font-semibold uppercase px-2 py-1 ${
                                customer.active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {customer.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 p-6">
                    <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                        Account Info
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">First Name</p>
                            <p className="text-sm font-medium text-black">{customer.firstName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Last Name</p>
                            <p className="text-sm font-medium text-black">{customer.lastName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Email</p>
                            <p className="text-sm font-medium text-black">{customer.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Member Since</p>
                            <p className="text-sm font-medium text-black">
                                {new Date(customer.createdAt).toLocaleDateString('en-US', {
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
                    Orders
                </h2>

                {ordersLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="border border-gray-200 p-12 text-center">
                        <p className="text-sm text-gray-400">No orders yet</p>
                    </div>
                ) : (
                    <div className="border border-gray-200">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Order</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Date</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Items</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Total</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Status</th>
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
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {order.orderItems?.length || 0} items
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-black">
                                        ${order.totalAmount?.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold uppercase px-2 py-1 ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-200">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="text-sm font-medium px-4 py-1.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                                >
                                    Prev
                                </button>
                                <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="text-sm font-medium px-4 py-1.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCustomerDetail;