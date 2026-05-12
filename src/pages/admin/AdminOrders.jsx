import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateOrderStatus } from '../../api/orderApi';
import axiosInstance from '../../api/axiosInstance';
import {useNavigate} from "react-router-dom";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAllOrders = async () => {
        try {
            const response = await axiosInstance.get('/orders/all');
            setOrders(response.data);
        } catch (e) {
            toast.error('Failed to load orders, error: ' + e.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    Orders
                </h1>
                <p className="text-sm text-gray-500">Manage customer orders</p>
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
                                    <p className="text-sm font-semibold text-black">#{order.id}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-sm text-black">
                                    User #{order.userId}
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
                </div>
            )}
        </div>
    );
};

export default AdminOrders;