import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/cartApi';
import { checkout } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/common/Skeleton';

const CartPage = () => {
    const { user, setCartCount } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    const fetchCart = async () => {
        try {
            const response = await getCart(user.id);
            setCart(response.data);
            setCartCount(response.data.items.length);
        } catch (e) {
            toast.error('Failed to load cart, error: ' + e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (cartItemId, productId, quantity) => {
        if (quantity < 1) return;
        try {
            const response = await updateCartItem(user.id, cartItemId, { productId, quantity });
            setCart(response.data);
        } catch (e) {
            toast.error('Failed to update quantity, error: ' + e);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            const response = await removeCartItem(user.id, cartItemId);
            setCart(response.data);
            toast.success('Item removed');
        } catch (e) {
            toast.error('Failed to remove item, error: ' + e);
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart(user.id);
            setCart({ ...cart, items: [], totalAmount: 0 });
            toast.success('Cart cleared');
        } catch (e) {
            toast.error('Failed to clear cart, error: ' + e);
        }
    };

    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            await checkout(user.id);
            toast.success('Order placed!');
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-10">
                <Skeleton className="h-8 w-48 mb-10" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-6 pb-6 border-b border-gray-200">
                                <Skeleton className="w-28 h-28 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-8 w-32 mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Your Bag</h2>
                <p className="text-gray-500 mb-8">Your bag is empty</p>
                <button
                    onClick={() => navigate('/products')}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors"
                >
                    Shop Now
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-10">Your Bag</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.items.map(item => (
                        <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-200">
                            {/* Image */}
                            <div className="bg-gray-100 w-28 h-28 flex-shrink-0 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <h3 className="text-sm font-semibold text-black">
                                        {item.productName}
                                    </h3>
                                    <span className="text-sm font-bold text-black">
                                        ${item.subtotal.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mb-1">SKU: {item.productSku}</p>
                                <p className="text-xs text-gray-500 mb-4">
                                    ${item.productPrice} / item
                                </p>

                                <div className="flex items-center justify-between">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-gray-300">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-black"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-300">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-black"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-xs text-gray-400 hover:text-black transition-colors underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleClearCart}
                        className="text-xs text-gray-400 hover:text-black transition-colors underline"
                    >
                        Clear Bag
                    </button>
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                    <div className="border border-gray-200 p-6">
                        <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                            Order Summary
                        </h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">${cart.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span className="font-medium text-green-600">Free</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between">
                                <span className="font-semibold text-black">Total</span>
                                <span className="font-bold text-black">${cart.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-4 hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {checkingOut ? 'Processing...' : 'Checkout'}
                        </button>

                        <button
                            onClick={() => navigate('/products')}
                            className="w-full mt-3 border border-black text-black text-sm font-semibold uppercase tracking-wide py-4 hover:bg-gray-50 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;