import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrders } from '../api/orderApi';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/common/Skeleton';
import {getImageUrl} from "../utils/imageUtils.js";

const OrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getOrders(user.id, { page, size: 5 });
            setOrders(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (e) {
            toast.error('Failed to load orders, error: ' + e.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [user.id, page]);

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

    if (orders.length === 0 && !loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Your Orders</h2>
                <p className="text-gray-500 mb-8">You haven't placed any orders yet</p>
                <button
                    onClick={() => navigate('/products')}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black">
                        Your Orders
                    </h1>
                    {totalElements > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            {totalElements} order{totalElements !== 1 ? 's' : ''} total
                        </p>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border border-gray-200 p-6">
                            <div className="flex justify-between mb-6 pb-4 border-b border-gray-100">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, j) => (
                                    <div key={j} className="flex gap-4">
                                        <Skeleton className="w-16 h-16 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {orders.map(order => (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="border border-gray-200 p-6 block hover:border-black transition-colors"
                            >
                                {/* Order header */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                            Order #{order.id}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-sm font-bold text-black">
                                            ${order.totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Order items */}
                                <div className="space-y-4">
                                    {order.orderItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-gray-100 w-16 h-16 flex items-center justify-center flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={getImageUrl(item.imageUrl)}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No image</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-black">
                                                        {item.productName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        ${item.priceAtPurchase} / item
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-black">
                                                ${item.subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-10">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="text-sm font-medium px-6 py-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <span className="text-sm text-gray-500">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="text-sm font-medium px-6 py-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrdersPage;