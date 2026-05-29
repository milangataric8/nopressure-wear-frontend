import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {getOrderById, getOrderByIdAdmin, updateOrderStatus} from '../api/orderApi';
import { useAuth } from '../hooks/useAuth';
import {getImageUrl} from "../utils/imageUtils.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useTranslation } from 'react-i18next';

const OrderDetailPage = () => {
    const { t } = useTranslation();
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin, isEmployee } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const isStaff = isAdmin() || isEmployee();

    const fetchOrder = useCallback(async () => {
        try {
            let response;
            if (isStaff) {
                response = await getOrderByIdAdmin(orderId);
            } else {
                response = await getOrderById(user.id, orderId);
            }
            setOrder(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load order');
            navigate(isStaff ? '/admin/orders' : '/orders');
        } finally {
            setLoading(false);
        }
    }, [orderId, navigate, isStaff, user.id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleStatusUpdate = async (status) => {
        try {
            await updateOrderStatus(orderId, status);
            toast.success(t('messages.orderUpdated'));
            fetchOrder();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update status');
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

    const getStatusSteps = () => {
        const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
        const currentIndex = steps.indexOf(order?.status);
        return steps.map((step, index) => ({
            label: step,
            completed: index <= currentIndex,
            current: index === currentIndex,
        }));
    };

    {loading && <LoadingSpinner />}
    {loading && <LoadingSpinner height="h-32" />}

    if (!order) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <button
                onClick={() => navigate(isStaff ? '/admin/orders' : '/orders')}
                className="text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-black transition-colors mb-8"
            >
                {t('order.backToOrders')}
            </button>

            {/* Order header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        Order - {order.orderCode}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {t('order.placedOn')} {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1.5 ${getStatusStyle(order.status)}`}>
                    {order.status}
                </span>
                    {/* Status update for admin/employee */}
                    {isStaff && (
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            className="text-xs border border-gray-300 px-3 py-2 focus:outline-none focus:border-black transition-colors"
                        >
                            <option value="PENDING">{t('order.pending')}</option>
                            <option value="CONFIRMED">{t('order.confirmed')}</option>
                            <option value="SHIPPED">{t('order.shipped')}</option>
                            <option value="DELIVERED">{t('order.delivered')}</option>
                            <option value="CANCELLED">{t('order.cancelled')}</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Status tracker — don't show status CANCELLED */}
            {order.status !== 'CANCELLED' && (
                <div className="border border-gray-200 p-8 mb-8">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-6">
                        {t('order.orderStatus')}
                    </h2>
                    <div className="flex items-center justify-between relative">
                        {/* Progress line */}
                        <div className="absolute top-4 left-0 right-0 h-px bg-gray-200 z-0"></div>
                        <div
                            className="absolute top-4 left-0 h-px bg-black z-0 transition-all"
                            style={{
                                width: `${(getStatusSteps().filter(s => s.completed).length - 1) / 3 * 100}%`
                            }}
                        ></div>

                        {getStatusSteps().map((step) => (
                            <div key={step.label} className="flex flex-col items-center z-10">
                                <div className={`w-8 h-8 flex items-center justify-center border-2 ${
                                    step.completed
                                        ? 'bg-black border-black'
                                        : 'bg-white border-gray-300'
                                }`}>
                                    {step.completed && (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-xs uppercase tracking-wide mt-2 font-medium ${
                                    step.completed ? 'text-black' : 'text-gray-400'
                                }`}>
                                    {t(`order.${step.label.toLowerCase()}`)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order items */}
                <div className="lg:col-span-2">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                        {t('order.items')}
                    </h2>
                    <div className="border border-gray-200">
                        {order.orderItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex gap-4 p-4 ${
                                    index !== order.orderItems.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                            >
                                <div className="bg-gray-100 w-20 h-20 flex-shrink-0 flex items-center justify-center">
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
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="text-sm font-semibold text-black">
                                            {item.productName}
                                        </h3>
                                        <span className="text-sm font-bold text-black">
                                            ${item.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Qty: {item.quantity} × ${item.priceAtPurchase}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order summary */}
                <div>
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                        {t('order.summary')}
                    </h2>
                    <div className="border border-gray-200 p-6">
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('cart.subtotal')}</span>
                                <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('cart.delivery')}</span>
                                <span className="text-green-600">{t('cart.free')}</span>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4 flex justify-between">
                            <span className="font-semibold text-black">{t('cart.total')}</span>
                            <span className="font-bold text-black">${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-6 mt-4">
                        <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                            {t('order.orderInfo')}
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{t('order.orderId')}</span>
                                <span className="font-medium">#{order.id}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{t('order.date')}</span>
                                <span className="font-medium">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{t('order.status')}</span>
                                <span className="font-medium">{order.status}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{t('order.items')}</span>
                                <span className="font-medium">{order.orderItems.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer info */}
                    <div className="border border-gray-200 p-6 mt-4">
                        <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                            {t('order.customer')}
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Name</span>
                                <span className="font-medium">
                                    {order.customerFullName}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Email</span>
                                <span className="font-medium">{order.customerEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping address */}
                    <div className="border border-gray-200 p-6 mt-4">
                        <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                            {t('cart.shippingAddress')}
                        </h3>
                        {order.shippingStreet ? (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-black">{order.shippingStreet}</p>
                                <p className="text-xs text-gray-500">{order.shippingCity}, {order.shippingPostalCode}</p>
                                <p className="text-xs text-gray-500">{order.shippingCountry}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">No shipping address provided</p>
                        )}
                    </div>

                    {/* Payment info */}
                    <div className="border border-gray-200 p-6 mt-4">
                        <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                            {t('order.paymentInfo')}
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{t('order.method')}</span>
                                <span className="font-medium">
                                    {order.paymentMethod === 'CARD' ? t('order.creditCard') : t('order.cashOnDelivery')}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{t('order.status')}</span>
                                <span className={`font-semibold uppercase ${
                                    order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;