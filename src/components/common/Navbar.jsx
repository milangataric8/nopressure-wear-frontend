import { useState, useRef, useEffect, useContext } from 'react';
import ProductsMegaMenu from './ProductsMegaMenu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GuestCartContext } from '../../context/GuestCartContext';
import { getCart } from '../../api/cartApi';
import { getOrders } from '../../api/orderApi';
import { getActiveCategories } from '../../api/categoryApi';
import { getImageUrl } from '../../utils/imageUtils';
import { getSettingsMap } from "../../api/settingsApi.js";
import { useTranslation } from 'react-i18next';
import SocialIcons from "./SocialIcons.jsx";
import {useCurrency} from "../../context/CurrencyContext.jsx";
import { ADMIN_NAV } from "../../config/adminNav.js";

const Navbar = () => {
    const { user, logoutUser, isAuthenticated, isAdmin, isEmployee, cartCount, favoriteCount } = useAuth();
    const { guestCart } = useContext(GuestCartContext);
    const displayCartCount = isAuthenticated() ? cartCount : guestCart.length;
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState(null);
    const [orders, setOrders] = useState([]);
    const [storeName, setStoreName] = useState('NoPressure');
    const [logoUrl, setLogoUrl] = useState('');
    const dropdownRef = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openGender, setOpenGender] = useState(null);
    const { t, i18n } = useTranslation();
    const [socialSettings, setSocialSettings] = useState({});
    const [storeSettings, setStoreSettings] = useState({});
    const { format } = useCurrency();
    const rootCategories = (categories || []).filter(cat => !cat.parentId);

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

    useEffect(() => {
        getSettingsMap().then(r => setSocialSettings(r.data)).catch(() => {});

        const handler = () => {
            getSettingsMap().then(r => setSocialSettings(r.data)).catch(() => {});
        };
        window.addEventListener('settings-updated', handler);
        return () => window.removeEventListener('settings-updated', handler);
    }, []);

    useEffect(() => {
        getSettingsMap().then(r => setStoreSettings(r.data)).catch(() => {});

        const handler = () => {
            getSettingsMap().then(r => setStoreSettings(r.data)).catch(() => {});
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
        <div ref={dropdownRef} className="fixed top-0 left-0 right-0 z-50">
            {/* Top mini navbar */}
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-between">
                    {/* Social icons — left */}
                    <div className="flex items-center">
                        <SocialIcons settings={socialSettings} size="sm" />
                    </div>

                    {/* Auth links + language — right */}
                    <div className="flex items-center gap-6 ml-auto">
                        {storeSettings.multilanguage_enabled !== 'false' && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={`text-xs uppercase transition-colors ${i18n.language === 'en' ? 'font-bold text-black' : 'font-medium text-gray-400 hover:text-black'}`}
                                >
                                    EN
                                </button>
                                <span className="text-gray-300 text-xs select-none">|</span>
                                <button
                                    onClick={() => i18n.changeLanguage('sr')}
                                    className={`text-xs uppercase transition-colors ${i18n.language === 'sr' ? 'font-bold text-black' : 'font-medium text-gray-400 hover:text-black'}`}
                                >
                                    SR
                                </button>
                            </div>
                        )}

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
            </div>

            {/* Main navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center h-16 gap-3">

                        {/* ── LEFT ── mobile: logo | desktop: nav links ── */}
                        <div className="flex items-center gap-8 flex-1 min-w-0">

                            {/* Logo — mobile/tablet only, left aligned */}
                            <Link to="/" className="lg:hidden flex items-center flex-shrink-0">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl.startsWith('http')
                                            ? logoUrl
                                            : `${import.meta.env.VITE_API_URL}${logoUrl}`}
                                        alt={storeName}
                                        className="h-9 w-auto object-contain"
                                    />
                                ) : (
                                    <span className="text-base font-black tracking-tight text-black uppercase">
                                        {storeName}
                                    </span>
                                )}
                            </Link>

                        <div className="hidden lg:flex items-center gap-8">
                            {/* Products mega-menu */}
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
                                    <ProductsMegaMenu
                                        categories={rootCategories}
                                        onNavigate={() => setActiveDropdown(null)}
                                    />
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
                                                                    <p className="text-xs font-bold text-black">{format(order.totalAmount)}</p>
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
                                        <div className="absolute top-full left-0 pt-4 z-50">
                                            <div className="bg-white border border-gray-200 shadow-lg w-56">
                                                {ADMIN_NAV.map((group, gi) => {
                                                    if (group.adminOnly && !isAdmin()) return null;
                                                    return (
                                                        <div key={group.section}>
                                                            {gi > 0 && <div className="border-t border-gray-200 mt-1" />}
                                                            <p className="px-4 pt-3 pb-1 text-xs font-black uppercase tracking-wide text-gray-500">
                                                                {t(group.section)}
                                                            </p>
                                                            {group.items.map(item => (
                                                                <Link
                                                                    key={item.to}
                                                                    to={item.to}
                                                                    onClick={() => setActiveDropdown(null)}
                                                                    className={`block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors ${item.bold ? 'font-bold' : ''}`}
                                                                >
                                                                    {t(item.label)}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    );
                                                })}

                                                <div className="h-1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {storeSettings.contact_enabled !== 'false' && (
                                <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                                    {t('admin.contact')}
                                </Link>
                            )}
                        </div>
                        </div>

                        {/* ── CENTER ── logo, desktop only ── */}
                        <Link to="/" className="hidden lg:flex items-center flex-shrink-0">
                            {logoUrl ? (
                                <img
                                    src={logoUrl.startsWith('http')
                                        ? logoUrl
                                        : `${import.meta.env.VITE_API_URL}${logoUrl}`}
                                    alt={storeName}
                                    className="h-12 w-auto object-contain"
                                />
                            ) : (
                                <span className="text-xl font-black tracking-tight text-black uppercase">
                                    {storeName}
                                </span>
                            )}
                        </Link>

                        {/* ── RIGHT ── search, favorites, cart, hamburger ── */}
                        <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                            {/* Search — desktop */}
                            <form onSubmit={handleSearch} className="hidden lg:flex items-stretch">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder={t('nav.search')}
                                        className="bg-gray-100 border-none px-3 py-0 text-sm w-40 h-8 focus:outline-none text-gray-600 placeholder-gray-400"
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
                                    className="bg-gray-100 text-gray-500 px-3 h-8 hover:text-black transition-colors flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"/>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                </button>
                            </form>

                            {/* Favorites heart icon */}
                            {isAuthenticated() && socialSettings.favorites_enabled !== 'false' && (
                                <Link to="/favorites" className="relative flex items-center text-gray-600 hover:text-black transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                    {favoriteCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-4 h-4 flex items-center justify-center">
                                            {favoriteCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Cart */}
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
                                    {displayCartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-4 h-4 flex items-center justify-center">
                                            {displayCartCount}
                                        </span>
                                    )}
                                </Link>

                                {activeDropdown === 'cart' && (
                                    <div className="absolute top-full right-0 mt-0 bg-white border border-gray-200 shadow-lg z-50 p-4 w-72">
                                        {isAuthenticated() ? (
                                            !cart || cart.items.length === 0 ? (
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
                                                                        <span className="text-gray-400 text-xs">{t('common.noImage')}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-black truncate">{item.productName}</p>
                                                                    <p className="text-xs text-gray-400">{t('order.qty')}: {item.quantity} × {format(item.productPrice)}</p>
                                                                </div>
                                                                <span className="text-xs font-bold text-black">{format(item.subtotal)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center mb-3">
                                                        <span className="text-xs font-semibold text-black">{t('cart.total')}</span>
                                                        <span className="text-sm font-bold text-black">{format(cart.totalAmount)}</span>
                                                    </div>
                                                    <Link
                                                        to="/cart"
                                                        onClick={() => setActiveDropdown(null)}
                                                        className="block w-full text-center bg-black text-white text-xs font-semibold uppercase tracking-wide py-2 hover:bg-gray-800 transition-colors"
                                                    >
                                                        {t('nav.viewCart')}
                                                    </Link>
                                                </>
                                            )
                                        ) : (
                                            guestCart.length === 0 ? (
                                                <p className="text-xs text-gray-400 text-center py-4">{t('nav.cartEmpty')}</p>
                                            ) : (
                                                <>
                                                    <div className="space-y-3 mb-4">
                                                        {guestCart.slice(0, 3).map(item => (
                                                            <div key={item.productId} className="flex gap-3 items-center">
                                                                <div className="bg-gray-100 w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                                                    {item.imageUrl ? (
                                                                        <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-contain p-1" alt={item.productName} />
                                                                    ) : (
                                                                        <span className="text-gray-400 text-xs">{t('common.noImage')}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-black truncate">{item.productName}</p>
                                                                    <p className="text-xs text-gray-400">{t('order.qty')}: {item.quantity} × {format(item.discountPrice ?? item.price)}</p>
                                                                </div>
                                                                <span className="text-xs font-bold text-black">{format((item.discountPrice ?? item.price) * item.quantity)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center mb-3">
                                                        <span className="text-xs font-semibold text-black">{t('cart.total')}</span>
                                                        <span className="text-sm font-bold text-black">
                                                            {format(guestCart.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0))}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        to="/cart"
                                                        onClick={() => setActiveDropdown(null)}
                                                        className="block w-full text-center bg-black text-white text-xs font-semibold uppercase tracking-wide py-2 hover:bg-gray-800 transition-colors"
                                                    >
                                                        {t('nav.viewCart')}
                                                    </Link>
                                                </>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Mobile hamburger */}
                            <button
                                className="lg:hidden p-2 text-gray-600 hover:text-black"
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

                        {/* Mobile menu — fixed full-screen overlay below the navbar */}
                        {mobileMenuOpen && (
                            <div className="lg:hidden fixed left-0 right-0 top-24 bottom-0 bg-white z-40 overflow-y-auto border-t border-gray-200">
                                <div className="px-6 py-4 space-y-4">
                                    {/* Search */}
                                    <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="flex">
                                        <div className="relative flex-1">
                                            <input
                                                type="search"
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                                placeholder={t('nav.search')}
                                                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                                            />
                                            {searchInput && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchInput('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-1 text-gray-400 hover:text-black text-lg leading-none"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                        <button type="submit" className="bg-black text-white px-3 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <circle cx="11" cy="11" r="8"/>
                                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                            </svg>
                                        </button>
                                    </form>

                                    {/* Products accordion */}
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wide text-gray-500 mb-2">{t('nav.products')}</p>
                                        {[{ key: 'MEN', labelKey: 'nav.men' }, { key: 'WOMEN', labelKey: 'nav.women' }].map(g => (
                                            <div key={g.key} className="mb-1">
                                                <button
                                                    onClick={() => setOpenGender(prev => prev === g.key ? null : g.key)}
                                                    className="w-full flex items-center justify-between py-2 text-sm font-semibold text-black"
                                                >
                                                    {t(g.labelKey)}
                                                    <span className="text-gray-400">{openGender === g.key ? '−' : '+'}</span>
                                                </button>
                                                {openGender === g.key && (
                                                    <div className="ml-3 border-l border-gray-200 pl-3 space-y-1 mb-2">
                                                        <Link
                                                            to={`/products?gender=${g.key}`}
                                                            onClick={() => { setMobileMenuOpen(false); setOpenGender(null); }}
                                                            className="block text-sm text-gray-500 hover:text-black py-1"
                                                        >
                                                            {t('nav.allCategory')}
                                                        </Link>
                                                        {rootCategories.map(cat => (
                                                            <Link
                                                                key={cat.id}
                                                                to={`/products?gender=${g.key}&category=${cat.id}`}
                                                                onClick={() => { setMobileMenuOpen(false); setOpenGender(null); }}
                                                                className="block text-sm text-gray-500 hover:text-black py-1"
                                                            >
                                                                {cat.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-gray-400 hover:text-black py-1 mb-1">{t('nav.viewAllProducts')} →</Link>
                                    </div>
                                    {isAuthenticated() && (
                                        <>
                                            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-black py-1">{t('nav.orders')}</Link>
                                        </>
                                    )}

                                    {(isAdmin() || isEmployee()) && (
                                        <div className="border-t border-gray-200 pt-3">
                                            {ADMIN_NAV.map((group, gi) => {
                                                if (group.adminOnly && !isAdmin()) return null;
                                                return (
                                                    <div key={group.section}>
                                                        <p className={`text-xs font-black text-gray-500 uppercase tracking-wide mb-2 ${gi > 0 ? 'mt-3' : ''}`}>
                                                            {t(group.section)}
                                                        </p>
                                                        {group.items.map(item => (
                                                            <Link
                                                                key={item.to}
                                                                to={item.to}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className={`block text-sm text-gray-600 hover:text-black py-2 ${item.bold ? 'font-bold' : ''}`}
                                                            >
                                                                {t(item.label)}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-black py-1">
                                        {t('admin.contact')}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;