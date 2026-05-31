import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCart } from '../../api/cartApi';
import { getOrders } from '../../api/orderApi';
import { getActiveCategories } from '../../api/categoryApi';
import { getImageUrl } from '../../utils/imageUtils';
import { getSettingsMap } from "../../api/settingsApi.js";
import { useTranslation } from 'react-i18next';

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const rootCategories = (categories || []).filter(cat => !cat.parentId);
    const getSubcategories = (parentId) => (categories || []).filter(cat => cat.parentId === parentId);

    useEffect(() => {
        const loadCategories = () => {
            getActiveCategories()
                .then(r => setCategories(r.data))
                .catch(() => {});
        };

        const loadSettings = () => {
            getSettingsMap().then(r => {
                if (r.data.store_name) setStoreName(r.data.store_name);
                if (r.data.store_logo_url) setLogoUrl(r.data.store_logo_url);
            }).catch(() => {});
        };

        loadCategories();
        loadSettings();

        window.addEventListener('categories-updated', loadCategories);
        window.addEventListener('settings-updated', loadSettings);

        return () => {
            window.removeEventListener('categories-updated', loadCategories);
            window.removeEventListener('settings-updated', loadSettings);
        };
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

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'sr' : 'en';
        i18n.changeLanguage(newLang);
    };

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
        <div ref={dropdownRef} className="fixed top-0 left-0 right-0 z-50">
            {/* Top mini navbar */}
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-end gap-6">
                    {/* Language switcher */}
                    <button
                        onClick={toggleLanguage}
                        className="text-xs text-gray-500 hover:text-black transition-colors uppercase font-medium"
                    >
                        {i18n.language === 'en' ? 'SR' : 'EN'}
                    </button>

                    {isAuthenticated() ? (
                        <>
                            <Link to="/profile" className="text-xs text-black hover:text-black transition-colors">
                                {user?.firstName} {user?.lastName}
                            </Link>
                            <button onClick={handleLogout} className="text-xs text-black hover:text-black transition-colors">
                                {t('nav.signOut')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-xs text-black hover:text-black transition-colors">
                                {t('nav.signIn')}
                            </Link>
                            <Link to="/register" className="text-xs text-black hover:text-black transition-colors">
                                {t('nav.joinUs')}
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Main navbar */}
            <nav className="bg-white border-b border-gray-200">
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
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">

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
                                    {t('nav.products')}
                                </Link>

                                {activeDropdown === 'products' && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50">
                                        <div className="bg-white border border-gray-200 shadow-lg p-6 w-auto">
                                            <div className="flex gap-8 mb-4">
                                                {rootCategories.map(cat => (
                                                    <div key={cat.id} className="flex-shrink-0">
                                                        <Link
                                                            to={`/products?category=${cat.id}`}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="text-xs font-black uppercase tracking-wide text-black hover:underline block mb-2 whitespace-nowrap"
                                                        >
                                                            {cat.name}
                                                        </Link>
                                                        {getSubcategories(cat.id).map(sub => (
                                                            <Link
                                                                key={sub.id}
                                                                to={`/products?category=${sub.id}`}
                                                                onClick={() => setActiveDropdown(null)}
                                                                className="block text-xs text-gray-500 hover:text-black transition-colors py-0.5 whitespace-nowrap"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-200 pt-2">
                                                <Link
                                                    to="/products"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="text-xs font-semibold uppercase tracking-wide text-black hover:underline whitespace-nowrap"
                                                >
                                                    {t('nav.viewAllProducts')} →
                                                </Link>
                                            </div>
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
                                        {t('nav.orders')}
                                    </Link>

                                    {activeDropdown === 'orders' && (
                                        <div className="absolute top-full right-0 mt-0 bg-white border border-gray-200 shadow-lg z-50 p-4 w-72">
                                            {orders.length === 0 ? (
                                                <p className="text-xs text-gray-400 text-center py-4">{t('order.empty')}</p>
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
                                                        {t('nav.viewAllOrders')}
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
                                        {t('nav.admin')}
                                    </Link>

                                    {activeDropdown === 'admin' && (
                                        <div className="absolute top-full right-0 mt-0 bg-white border border-gray-200 shadow-lg z-50 py-2 w-48">
                                            <Link
                                                to="/admin/products"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                {t('admin.products')}
                                            </Link>
                                            <Link
                                                to="/admin/categories"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                {t('admin.categories')}
                                            </Link>
                                            <Link
                                                to="/admin/orders"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                {t('admin.orders')}
                                            </Link>
                                            <Link
                                                to="/admin/coupons"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                {t('admin.coupons')}
                                            </Link>
                                            {isAdmin() && (
                                                <Link
                                                    to="/admin/employees"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                                >
                                                    {t('admin.employees')}
                                                </Link>
                                            )}
                                            <Link
                                                to="/admin/banners"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                {t('admin.banners')}
                                            </Link>
                                            <Link
                                                to="/admin/customers"
                                                onClick={() => setActiveDropdown(null)}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                            >
                                                {t('admin.customers')}
                                            </Link>
                                            {isAdmin() && (
                                                <Link
                                                    to="/admin/settings"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                                >
                                                    {t('admin.settings')}
                                                </Link>
                                            )}
                                            {isAdmin() && (
                                                <Link
                                                    to="/admin/popups"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                                                >
                                                    {t('admin.popups')}
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button + search + cart */}
                        <div className="flex items-center gap-2">
                            {/* Search — desktop */}
                            <form onSubmit={handleSearch} className="hidden md:flex items-stretch">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder={t('nav.search')}
                                        className="border border-gray-300 px-3 py-0 text-sm w-40 h-8 focus:outline-none focus:border-black transition-colors pr-6"
                                    />
                                    {searchInput && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearchInput(''); navigate('/products'); }}
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

                            {/* Mobile search */}
                            <div className="relative md:hidden flex items-center">
                                {mobileSearchOpen && (
                                    <form
                                        onSubmit={(e) => { handleSearch(e); setMobileSearchOpen(false); }}
                                        className="absolute right-8 flex items-center"
                                        style={{ width: '200px' }}
                                    >
                                        <input
                                            type="text"
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            placeholder={t('nav.search')}
                                            className="w-full border border-gray-300 px-3 h-8 text-sm focus:outline-none focus:border-black transition-colors"
                                            autoFocus
                                        />
                                        {searchInput && (
                                            <button
                                                type="button"
                                                onClick={() => { setSearchInput(''); setMobileSearchOpen(false); navigate('/products'); }}
                                                className="absolute right-1 text-gray-400 hover:text-black text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </form>
                                )}
                                <button
                                    onClick={() => {
                                        if (mobileSearchOpen && searchInput) {
                                            navigate(`/products?search=${searchInput.trim()}`);
                                            setSearchInput('');
                                        }
                                        setMobileSearchOpen(!mobileSearchOpen);
                                    }}
                                    className="text-gray-600 hover:text-black transition-colors p-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"/>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Cart */}
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
                                                <p className="text-xs text-gray-400 text-center py-4">{t('nav.cartEmpty')}</p>
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
                                                        <span className="text-xs font-semibold text-black">{t('cart.total')}</span>
                                                        <span className="text-sm font-bold text-black">${cart.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                    <Link
                                                        to="/cart"
                                                        onClick={() => setActiveDropdown(null)}
                                                        className="block w-full text-center bg-black text-white text-xs font-semibold uppercase tracking-wide py-2 hover:bg-gray-800 transition-colors"
                                                    >
                                                        {t('nav.viewCart')}
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mobile hamburger */}
                            <button
                                className="md:hidden p-2 text-gray-600 hover:text-black"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="3" y1="6" x2="21" y2="6"/>
                                        <line x1="3" y1="12" x2="21" y2="12"/>
                                        <line x1="3" y1="18" x2="21" y2="18"/>
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Mobile menu */}
                        {mobileMenuOpen && (
                            <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
                                {/* Search */}
                                <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="flex">
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder={t('nav.search')}
                                        className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                                    />
                                    <button type="submit" className="bg-black text-white px-3 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <circle cx="11" cy="11" r="8"/>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                        </svg>
                                    </button>
                                </form>

                                {/* Links */}
                                <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-black py-1">{t('nav.products')}</Link>
                                {isAuthenticated() && (
                                    <>
                                        <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-black py-1">{t('nav.orders')}</Link>
                                        <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-black py-1">{t('cart.title')}</Link>
                                    </>
                                )}

                                {(isAdmin() || isEmployee()) && (
                                    <div className="border-t border-gray-200 pt-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{t('nav.admin')}</p>
                                        <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.products')}</Link>
                                        <Link to="/admin/categories" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.categories')}</Link>
                                        <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.orders')}</Link>
                                        <Link to="/admin/coupons" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.coupons')}</Link>
                                        <Link to="/admin/customers" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.customers')}</Link>
                                        <Link to="/admin/banners" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.banners')}</Link>
                                        {isAdmin() && (
                                            <>
                                                <Link to="/admin/employees" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.employees')}</Link>
                                                <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.settings')}</Link>
                                                <Link to="/admin/popups" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-1">{t('admin.popups')}</Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;