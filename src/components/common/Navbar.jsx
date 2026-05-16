import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCart } from '../../api/cartApi';
import { getOrders } from '../../api/orderApi';
import { getCategories } from '../../api/categoryApi';
import { getImageUrl } from '../../utils/imageUtils';
import {getSettingsMap} from "../../api/settingsApi.js";

const Navbar = () => {
    const { user, logoutUser, isAuthenticated, isAdmin, isEmployee, cartCount} = useAuth();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState(null);
    const [orders, setOrders] = useState([]);
    const [storeName, setStoreName] = useState('WEBSHOP');
    const [logoUrl, setLogoUrl] = useState('');
    const dropdownRef = useRef(null);

    const rootCategories = (categories || []).filter(cat => !cat.parentId);
    const getSubcategories = (parentId) => (categories || []).filter(cat => cat.parentId === parentId);

    useEffect(() => {
        getCategories().then(r => setCategories(r.data.content)).catch(() => {});
    }, []);

    useEffect(() => {
        if (activeDropdown === 'cart' && isAuthenticated() && user?.id) {
            getCart(user.id).then(r => setCart(r.data)).catch(() => {});
        }
        if (activeDropdown === 'orders' && isAuthenticated() && user?.id) {
            getOrders(user.id, { page: 0, size: 3 }).then(r => setOrders(r.data.content)).catch(() => {});
        }
    }, [activeDropdown]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        import('../../api/settingsApi').then(({ getSettingsMap }) => {
            getSettingsMap().then(r => {
                if (r.data.store_name) setStoreName(r.data.store_name);
            }).catch(() => {});
        });
    }, []);

    useEffect(() => {
        getSettingsMap().then(r => {
            if (r.data.store_name) setStoreName(r.data.store_name);
            if (r.data.store_logo_url) setLogoUrl(r.data.store_logo_url);
        }).catch(() => {});

        const handler = () => {
            getSettingsMap().then(r => {
                if (r.data.store_name) setStoreName(r.data.store_name);
                if (r.data.store_logo_url) setLogoUrl(r.data.store_logo_url);
            }).catch(() => {});
        };
        window.addEventListener('settings-updated', handler);
        return () => window.removeEventListener('settings-updated', handler);
    }, []);

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/products?search=${searchInput.trim()}`);
            setSearchInput('');
            setActiveDropdown(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600';
            case 'CONFIRMED': return 'text-blue-600';
            case 'SHIPPED': return 'text-purple-600';
            case 'DELIVERED': return 'text-green-600';
            case 'CANCELLED': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div ref={dropdownRef}>
            {/* Top mini navbar */}
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-end gap-6">
                    {isAuthenticated() ? (
                        <>
                            <Link to="/profile" className="text-xs text-black hover:text-black transition-colors">
                                {user?.firstName} {user?.lastName}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-black hover:text-black transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-xs text-black hover:text-black transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="text-xs text-black hover:text-black transition-colors">
                                Join Us
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Main navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16 relative">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            {logoUrl ? (
                                <img
                                    src={logoUrl.startsWith('http')
                                        ? logoUrl
                                        : `${import.meta.env.VITE_API_URL}${logoUrl}`}
                                    alt={storeName}
                                    className="h-15 object-contain"
                                />
                            ) : (
                                <span className="text-xl font-black tracking-tight text-black uppercase">
                                    {storeName}
                                </span>
                            )}
                        </Link>

                        {/* Center links */}
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">

                            {/* Products */}
                            <div
                                className="relative"
                                onMouseEnter={() => setActiveDropdown('products')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    to="/products"
                                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                >
                                    Products
                                </Link>

                                {activeDropdown === 'products' && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-white border border-gray-200 shadow-lg z-50 p-6 min-w-96">
                                        <div className="grid grid-cols-3 gap-6 mb-4">
                                            {rootCategories.map(cat => (
                                                <div key={cat.id}>
                                                    <Link
                                                        to={`/products?category=${cat.id}`}
                                                        onClick={() => setActiveDropdown(null)}
                                                        className="text-xs font-black uppercase tracking-wide text-black hover:underline block mb-2"
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                    {getSubcategories(cat.id).map(sub => (
                                                        <Link
                                                            key={sub.id}
                                                            to={`/products?category=${sub.id}`}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="block text-xs text-gray-500 hover:text-black transition-colors py-0.5"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-200 mt-0 pt-2">
                                            <Link
                                                to="/products"
                                                onClick={() => setActiveDropdown(null)}
                                                className="text-xs font-semibold uppercase tracking-wide text-black hover:underline"
                                            >
                                                View All Products →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Orders */}
                            {isAuthenticated() && (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setActiveDropdown('orders')}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        to="/orders"
                                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                    >
                                        Orders
                                    </Link>

                                    {activeDropdown === 'orders' && (
                                        <div className="absolute top-full right-0 mt-0 bg-white border border-gray-200 shadow-lg z-50 p-4 w-72">
                                            {orders.length === 0 ? (
                                                <p className="text-xs text-gray-400 text-center py-4">No orders yet</p>
                                            ) : (
                                                <>
                                                    <div className="space-y-3 mb-4">
                                                        {orders.map(order => (
                                                            <Link
                                                                key={order.id}
                                                                to={`/orders/${order.id}`}
                                                                onClick={() => setActiveDropdown(null)}
                                                                className="flex items-center justify-between hover:bg-gray-50 p-2 transition-colors"
                                                            >
                                                                <div>
                                                                    <p className="text-xs font-semibold text-black">Order #{order.id}</p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={`text-xs font-semibold uppercase ${getStatusStyle(order.status)}`}>
                                                                        {order.status}
                                                                    </p>
                                                                    <p className="text-xs font-bold text-black">${order.totalAmount.toFixed(2)}</p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                    <Link
                                                        to="/orders"
                                                        onClick={() => setActiveDropdown(null)}
                                                        className="block w-full text-center border border-black text-black text-xs font-semibold uppercase tracking-wide py-2 hover:bg-gray-50 transition-colors"
                                                    >
                                                        View All Orders
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Admin */}
                            {(isAdmin() || isEmployee()) && (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setActiveDropdown('admin')}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        to="/admin"
                                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                    >
                                        Admin
                                    </Link>

                                    {activeDropdown === 'admin' && (
                                        <div className="absolute top-full right-0 mt-0 bg-white border border-gray-200 shadow-lg z-50 py-2 w-48">
                                            <Link
                                                to="/admin/products"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                Products
                                            </Link>
                                            <Link
                                                to="/admin/categories"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                Categories
                                            </Link>
                                            <Link
                                                to="/admin/orders"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                Orders
                                            </Link>
                                            <Link
                                                to="/admin/coupons"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                Coupons
                                            </Link>
                                            {isAdmin() && (
                                                <Link
                                                    to="/admin/employees"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                                >
                                                    Employees
                                                </Link>
                                            )}
                                            <Link
                                                to="/admin/banners"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                Banners
                                            </Link>
                                            <Link
                                                to="/admin/customers"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                Customers
                                            </Link>
                                            {isAdmin() && (
                                                <Link
                                                    to="/admin/settings"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                                >
                                                    Settings
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Search + Cart — right side */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex items-stretch">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search..."
                                        className="border border-gray-300 px-3 py-0 text-sm w-40 h-8 focus:outline-none focus:border-black transition-colors pr-6"
                                    />
                                    {searchInput && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchInput('');
                                                navigate('/products');
                                            }}
                                            className="absolute right-1 text-gray-400 hover:text-black transition-colors text-lg leading-none"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="bg-black text-white px-3 h-8 hover:bg-gray-800 transition-colors flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"/>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                </button>
                            </form>

                            {/* Cart icon */}
                            {isAuthenticated() && (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setActiveDropdown('cart')}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link to="/cart" className="relative flex items-center text-gray-600 hover:text-black transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                            <line x1="3" y1="6" x2="21" y2="6"/>
                                            <path d="M16 10a4 4 0 0 1-8 0"/>
                                        </svg>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-4 h-4 flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>

                                    {activeDropdown === 'cart' && (
                                        <div className="absolute top-full right-0 mt-0 bg-white border border-gray-200 shadow-lg z-50 p-4 w-72">
                                            {!cart || cart.items.length === 0 ? (
                                                <p className="text-xs text-gray-400 text-center py-4">Your cart is empty</p>
                                            ) : (
                                                <>
                                                    <div className="space-y-3 mb-4">
                                                        {cart.items.slice(0, 3).map(item => (
                                                            <div key={item.id} className="flex gap-3 items-center">
                                                                <div className="bg-gray-100 w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                                                    {item.imageUrl ? (
                                                                        <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-contain p-1" alt={item.productName} />
                                                                    ) : (
                                                                        <span className="text-gray-400 text-xs">No img</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-black truncate">{item.productName}</p>
                                                                    <p className="text-xs text-gray-400">Qty: {item.quantity} × ${item.productPrice}</p>
                                                                </div>
                                                                <span className="text-xs font-bold text-black">${item.subtotal.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center mb-3">
                                                        <span className="text-xs font-semibold text-black">Total</span>
                                                        <span className="text-sm font-bold text-black">${cart.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                    <Link
                                                        to="/cart"
                                                        onClick={() => setActiveDropdown(null)}
                                                        className="block w-full text-center bg-black text-white text-xs font-semibold uppercase tracking-wide py-2 hover:bg-gray-800 transition-colors"
                                                    >
                                                        View Cart
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;