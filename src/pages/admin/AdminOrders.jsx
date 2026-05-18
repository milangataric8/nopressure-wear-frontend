import {useNavigate} from "react-router-dom";
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {getOrdersByAdmin, updateOrderStatus} from '../../api/orderApi';
import Pagination from "../../components/common/Pagination.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchAllOrders = async () => {
        try {
            const params = { page, size: 10 };
            if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery;
            if (statusFilter && statusFilter.trim() !== '') params.status = statusFilter;

            const response = await getOrdersByAdmin(params);
            setOrders(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error('Failed to load orders, error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, [page, searchQuery, statusFilter]);

    const handleStatusUpdate = async (orderId, status) => {
        try {
            await updateOrderStatus(orderId, status);
            toast.success('Order status updated');
            fetchAllOrders();
        } catch (e) {
            toast.error('Failed to update status, error: ' + e.message || 'Unknown error');
        }
    };

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

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    Orders
                </h1>
                <p className="text-sm text-gray-500">Manage customer orders</p>
            </div>

            {/* Search */}
            <form
                onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(0); }}
                className="flex gap-3 mb-6"
            >
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search orders by order code or customer name..."
                    className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button
                    type="submit"
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    Search
                </button>
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(0); }}
                        className="border border-gray-300 text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </form>

            {/* Status filter */}
            <div className="flex border border-gray-200 mb-6">
                {[
                    { label: 'Pending', value: 'PENDING', bg: 'bg-yellow-50', text: 'text-yellow-700', active: 'bg-yellow-100 text-yellow-800' },
                    { label: 'Confirmed', value: 'CONFIRMED', bg: 'bg-blue-50', text: 'text-blue-700', active: 'bg-blue-100 text-blue-800' },
                    { label: 'Shipped', value: 'SHIPPED', bg: 'bg-purple-50', text: 'text-purple-700', active: 'bg-purple-100 text-purple-800' },
                    { label: 'Delivered', value: 'DELIVERED', bg: 'bg-green-50', text: 'text-green-700', active: 'bg-green-100 text-green-800' },
                    { label: 'Cancelled', value: 'CANCELLED', bg: 'bg-red-50', text: 'text-red-700', active: 'bg-red-100 text-red-800' },
                ].map(status => (
                    <button
                        key={status.value}
                        onClick={() => {
                            setStatusFilter(prev => prev === status.value ? '' : status.value);
                            setPage(0);
                        }}
                        className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors border-r border-gray-200 last:border-r-0 ${
                            statusFilter === status.value
                                ? status.active
                                : `${status.bg} ${status.text} hover:opacity-80`
                        }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">No orders yet</p>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Order</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Customer</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Items</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Total</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Status</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Update Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map(order => (
                            <tr key={order.id}
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                                <td className="px-4 py-3">
                                    <p className="text-sm font-semibold text-black">{order.orderCode}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-sm text-black">
                                    {order.customerFullName}
                                </td>
                                <td className="px-4 py-3 text-sm text-black">
                                    {order.orderItems.length} items
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-black">
                                    ${order.totalAmount.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold uppercase px-2 py-1 ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                        className="text-xs border border-gray-300 px-2 py-1.5 focus:outline-none focus:border-black transition-colors"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                </div>
            )}
        </div>
    );
};

export default AdminOrders;