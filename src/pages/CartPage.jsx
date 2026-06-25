import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/cartApi';
import { checkout, guestCheckout } from '../api/orderApi';
import { useAuth } from '../hooks/useAuth';
import { validateCoupon } from '../api/couponApi';
import Skeleton from '../components/common/Skeleton';
import { getImageUrl } from "../utils/imageUtils.js";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/common/CheckoutForm';
import { createPaymentIntent } from '../api/paymentApi';
import { getAddressByUser, createAddress } from '../api/addressApi';
import { getSettingsMap } from '../api/settingsApi';
import PriceDisplay from "../components/common/PriceDisplay.jsx";
import { GuestCartContext } from '../context/GuestCartContext';
import {useCurrency} from "../context/CurrencyContext.jsx";
import ShippingAddressSelector from "../components/cart/ShippingAddressSelector.jsx";
import GuestInfoForm from "../components/cart/GuestInfoForm.jsx";
import PaymentMethodSelector from "../components/cart/PaymentMethodSelector.jsx";
import CouponInput from "../components/cart/CouponInput.jsx";

const CartPage = () => {
    const { t } = useTranslation();
    const { format } = useCurrency();
    const { user, setCartCount, isAuthenticated } = useAuth();
    const { guestCart, clearGuestCart, updateGuestCartItem, removeFromGuestCart } = useContext(GuestCartContext);
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(isAuthenticated());
    const [checkingOut, setCheckingOut] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const navigate = useNavigate();
    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [saveAddress, setSaveAddress] = useState(false);
    const [isMainAddress, setIsMainAddress] = useState(false);
    const [cardEnabled, setCardEnabled] = useState(true);
    const [codEnabled, setCodEnabled] = useState(true);
    const [addToCartEnabled, setAddToCartEnabled] = useState(true);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        postalCode: '',
        country: '',
    });
    const [guestInfo, setGuestInfo] = useState({
        fullName: '',
        email: '',
        phone: ''
    });

    const fetchCart = async () => {
        try {
            const response = await getCart(user.id);
            setCart(response.data);
            setCartCount(response.data.items.length);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoadCart'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated()) {
            fetchCart();
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            getAddressByUser(user.id)
                .then(r => setAddresses(r.data))
                .catch(() => {});
        }
    }, [user?.id]);

    useEffect(() => {
        getSettingsMap().then(r => {
            setCardEnabled(r.data.payment_card_enabled !== 'false');
            setCodEnabled(r.data.payment_cod_enabled !== 'false');
            setAddToCartEnabled(r.data.add_to_cart_enabled !== 'false');
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (cardEnabled && !codEnabled) setPaymentMethod('card');
        if (!cardEnabled && codEnabled) setPaymentMethod('cod');
    }, [cardEnabled, codEnabled]);

    const displayItems = isAuthenticated()
        ? (cart?.items ?? [])
        : guestCart.map(item => ({
            id: item.productId + (item.size || ''),
            productId: item.productId,
            productName: item.productName,
            imageUrl: item.imageUrl,
            productSku: null,
            productPrice: item.price,
            discountPrice: item.discountPrice ?? null,
            discountPercentage: null,
            subtotal: (item.discountPrice ?? item.price) * item.quantity,
            quantity: item.quantity,
            size: item.size ?? null,
        }));

    const displayTotal = isAuthenticated()
        ? (cart?.totalAmount ?? 0)
        : guestCart.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);

    const handleUpdateQuantity = async (cartItemId, productId, quantity, size = null) => {
        if (quantity < 1) return;
        if (!isAuthenticated()) {
            updateGuestCartItem(productId, quantity, size);
            return;
        }
        try {
            const response = await updateCartItem(user.id, cartItemId, { productId, quantity });
            setCart(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update quantity');
        }
    };

    const handleRemoveItem = async (cartItemId, productId = null, size = null) => {
        if (!isAuthenticated()) {
            removeFromGuestCart(productId, size);
            return;
        }
        try {
            const response = await removeCartItem(user.id, cartItemId);
            setCart(response.data);
            setCartCount(response.data.items.length);
            toast.success(t('messages.itemRemoved'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToRemoveItem'));
        }
    };

    const handleClearCart = async () => {
        if (!isAuthenticated()) {
            clearGuestCart();
            return;
        }
        try {
            await clearCart(user.id);
            setCart({ ...cart, items: [], totalAmount: 0 });
            setCartCount(0);
            toast.success(t('messages.cartCleared'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToClearCart'));
        }
    };

    const saveAddressIfNeeded = async () => {
        if (saveAddress && newAddress.street) {
            try {
                await createAddress(user.id, {
                    ...newAddress,
                    isMain: isMainAddress,
                });
            } catch (error) {
                console.log(error.response?.data?.message || 'Failed to save address');
            }
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            await saveAddressIfNeeded();
            await checkout(user.id, couponData?.code, 'CARD');
            setCartCount(0);
            toast.success(t('messages.paymentSuccess'));
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        }
    };

    const handleCashOnDelivery = async () => {
        if (!selectedAddress) {
            toast.error(t('cart.selectAddress'));
            return;
        }
        setCheckingOut(true);
        try {
            await saveAddressIfNeeded();
            await checkout(user.id, couponData?.code, 'COD');
            setCartCount(0);
            toast.success(t('messages.codSuccess'));
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setCheckingOut(false);
        }
    };

    const handleProceedToPayment = async () => {
        if (!selectedAddress) {
            toast.error(t('cart.selectAddress'));
            return;
        }
        try {
            const response = await createPaymentIntent(user.id, couponData?.code || null);
            setClientSecret(response.data.clientSecret);
            setShowPayment(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initialize payment');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setApplyingCoupon(true);
        try {
            const response = await validateCoupon(couponCode, user?.id);
            setCouponData(response.data);
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon');
            setCouponData(null);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleGuestCheckout = async () => {
        if (!newAddress.street) {
            toast.error('Please enter shipping address');
            return;
        }

        const orderData = {
            customerFullName: guestInfo.fullName,
            customerEmail: guestInfo.email,
            customerPhone: guestInfo.phone,
            street: newAddress.street,
            city: newAddress.city,
            postalCode: newAddress.postalCode,
            country: newAddress.country,
            items: guestCart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
            couponCode: couponData?.code || null,
            paymentMethod: paymentMethod === 'card' ? 'CARD' : 'COD',
        };

        try {
            await guestCheckout(orderData);
            clearGuestCart();
            toast.success('Order placed successfully!');
            navigate('/order-confirmation');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
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

    const isEmpty = isAuthenticated()
        ? (!cart || cart.items.length === 0)
        : guestCart.length === 0;

    if (isEmpty) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">{t('cart.title')}</h2>
                <p className="text-gray-500 mb-8">{t('cart.empty')}</p>
                <button
                    onClick={() => navigate('/products')}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors"
                >
                    {t('cart.continueShopping')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-10">{t('cart.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-6">
                    {displayItems.map(item => (
                        <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-200">
                            {/* Image */}
                            <div className="bg-gray-100 w-28 h-28 flex-shrink-0 flex items-center justify-center">
                                {item.imageUrl ? (
                                    <img
                                        src={getImageUrl(item.imageUrl)}
                                        alt={item.productName}
                                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-xs">{t('common.noImage')}</span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <h3 className="text-sm font-semibold text-black">
                                        {item.productName}
                                    </h3>
                                    <span className="text-sm font-bold text-black">
                                        {format(item.subtotal)}
                                    </span>
                                </div>
                                {item.productSku && (
                                    <p className="text-xs text-gray-400 mb-1">{t('cart.sku')}: {item.productSku}</p>
                                )}
                                {item.size && (
                                    <p className="text-xs text-gray-400 mb-1">{t('product.size')}: {item.size}</p>
                                )}
                                <div className="text-xs text-gray-400 mb-1">
                                    <PriceDisplay
                                        price={item.productPrice}
                                        discountPrice={item.discountPrice}
                                        discountPercentage={item.discountPercentage}
                                        size="sm"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-gray-300">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity - 1, item.size)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-black"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-300">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity + 1, item.size)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-black"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => handleRemoveItem(item.id, item.productId, item.size)}
                                        className="text-xs text-gray-400 hover:text-black transition-colors underline"
                                    >
                                        {t('common.remove')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleClearCart}
                        className="text-xs text-gray-400 hover:text-black transition-colors underline"
                    >
                        {t('cart.clearBag')}
                    </button>
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                    <div className="border border-gray-200 p-6">
                        <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                            {t('cart.orderSummary')}
                        </h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('cart.subtotal')}</span>
                                <span className="font-medium">{format(displayTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('cart.delivery')}</span>
                                <span className="font-medium text-green-600">{t('cart.free')}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between">
                                <span className="font-semibold text-black">{t('cart.total')}</span>
                                <span className="font-bold text-black">{format(displayTotal)}</span>
                            </div>
                        </div>

                        {addToCartEnabled && (
                            <ShippingAddressSelector
                                isAuthenticated={isAuthenticated}
                                addresses={addresses}
                                selectedAddress={selectedAddress}
                                setSelectedAddress={setSelectedAddress}
                                showNewAddress={showNewAddress}
                                setShowNewAddress={setShowNewAddress}
                                newAddress={newAddress}
                                setNewAddress={setNewAddress}
                                saveAddress={saveAddress}
                                setSaveAddress={setSaveAddress}
                                isMainAddress={isMainAddress}
                                setIsMainAddress={setIsMainAddress}
                                orderingEnabled={addToCartEnabled}
                            />
                        )}

                        {!isAuthenticated() && (
                            <GuestInfoForm guestInfo={guestInfo} setGuestInfo={setGuestInfo} />
                        )}

                        {!showPayment ? (
                            <PaymentMethodSelector
                                cardEnabled={cardEnabled}
                                codEnabled={codEnabled}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                isAuthenticated={isAuthenticated}
                                displayItems={displayItems}
                                checkingOut={checkingOut}
                                orderingEnabled={addToCartEnabled}
                                onProceedToPayment={handleProceedToPayment}
                                onCashOnDelivery={handleCashOnDelivery}
                                onGuestCheckout={handleGuestCheckout}
                            />
                        ) : (
                            <>
                                {clientSecret && (
                                    <Elements
                                        stripe={stripePromise}
                                        options={{
                                            clientSecret,
                                            appearance: {
                                                theme: 'stripe',
                                                variables: {
                                                    colorPrimary: '#000000',
                                                    fontFamily: 'system-ui, sans-serif',
                                                },
                                            },
                                        }}
                                        key={clientSecret}
                                    >
                                        <CheckoutForm onSuccess={handlePaymentSuccess} />
                                    </Elements>
                                )}
                                <button
                                    onClick={() => { setShowPayment(false); setClientSecret(null); }}
                                    className="w-full mt-3 border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-50 transition-colors"
                                >
                                    {t('cart.backToCart')}
                                </button>
                            </>
                        )}

                        {addToCartEnabled && (
                            <button
                                onClick={() => navigate('/products')}
                                className="w-full mt-3 border border-black text-black text-sm font-semibold uppercase tracking-wide py-4 hover:bg-gray-50 transition-colors"
                            >
                                {t('cart.continueShopping')}
                            </button>
                        )}
                    </div>

                    <CouponInput
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        couponData={couponData}
                        setCouponData={setCouponData}
                        applyingCoupon={applyingCoupon}
                        onApplyCoupon={handleApplyCoupon}
                    />

                    {/* Order summary amounts */}
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t('cart.subtotal')}</span>
                            <span className="font-medium">{format(displayTotal)}</span>
                        </div>
                        {couponData && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('cart.discount', { code: couponData.code })}</span>
                                <span className="font-medium text-green-600">
                                    -{format(couponData.discountAmount)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t('cart.delivery')}</span>
                            <span className="font-medium text-green-600">{t('cart.free')}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between">
                            <span className="font-semibold text-black">{t('cart.total')}</span>
                            <span className="font-bold text-black">
                                {format(couponData ? couponData.finalTotal : displayTotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
