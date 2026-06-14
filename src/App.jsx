import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { getCart } from './api/cartApi';
import { getSettingsMap } from './api/settingsApi';
import { getFavoriteCount } from './api/favoriteApi';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import ProfilePage from './pages/ProfilePage';
import AddressPage from './pages/AddressPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import Footer from './components/common/Footer';
import AdminCoupons from "./pages/admin/AdminCoupons.jsx";
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import AdminEmployees from "./pages/admin/AdminEmployees.jsx";
import AdminBanners from "./pages/admin/AdminBanners.jsx";
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPopups from './pages/admin/AdminPopups';
import AdminStores from "./pages/admin/AdminStores.jsx";
import FavoritesPage from './pages/FavoritesPage';
import AdminReports from "./pages/admin/AdminReports.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import i18n from './i18n/i18n';

function App() {
    const { user, isAuthenticated, setCartCount, setFavoriteCount } = useAuth();

    useEffect(() => {
        const initCart = async () => {
            if (isAuthenticated() && user?.id) {
                try {
                    const response = await getCart(user.id);
                    setCartCount(response.data.items.length);
                } catch (e) {
                    console.log(e.response?.data?.message || 'We have a problem with cart');
                }
            }
        };
        initCart();
    }, [user?.id]);

    useEffect(() => {
        const initData = async () => {
            if (isAuthenticated() && user?.id) {
                try {
                    const cartResponse = await getCart(user.id);
                    setCartCount(cartResponse.data.items.length);
                    const favResponse = await getFavoriteCount(user.id);
                    setFavoriteCount(favResponse.data.count);
                } catch (e) {
                    console.log('Init error: ' + e.message);
                }
            }
        };
        initData();
    }, [user?.id]);

    useEffect(() => {
        const applyLanguageSettings = () => {
            getSettingsMap().then(r => {
                const s = r.data;
                if (s.multilanguage_enabled === 'false' && s.default_language) {
                    // Multi-language off → force default language
                    i18n.changeLanguage(s.default_language);
                } else if (s.multilanguage_enabled !== 'false') {
                    // Multi-language on → use saved choice, or default if none saved
                    const saved = localStorage.getItem('i18nextLng');
                    if (!saved && s.default_language) {
                        i18n.changeLanguage(s.default_language);
                    }
                }
            }).catch(() => {});
        };

        applyLanguageSettings();
        window.addEventListener('settings-updated', applyLanguageSettings);
        return () => window.removeEventListener('settings-updated', applyLanguageSettings);
    }, []);

    const location = useLocation();

    const hideFooter = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)
        || location.pathname.startsWith('/admin');

    return (
        <>
            <Navbar />
            <div className="pt-16 md:pt-24">
                <Routes>
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/cart" element={
                        <ProtectedRoute><CartPage /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute><OrdersPage /></ProtectedRoute>
                    } />
                    <Route path="/orders/:orderId" element={
                        <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly employeeAllowed><AdminDashboard /></ProtectedRoute>
                    } />
                    <Route path="/admin/products" element={
                        <ProtectedRoute adminOnly employeeAllowed><AdminProducts /></ProtectedRoute>
                    } />
                    <Route path="/admin/categories" element={
                        <ProtectedRoute adminOnly employeeAllowed><AdminCategories /></ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <ProtectedRoute adminOnly employeeAllowed><AdminOrders /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/addresses" element={
                        <ProtectedRoute><AddressPage /></ProtectedRoute>
                    } />
                    <Route path="/change-password" element={
                        <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>
                    } />
                    <Route path="/admin/coupons" element={
                        <ProtectedRoute adminOnly employeeAllowed><AdminCoupons /></ProtectedRoute>
                    } />
                    <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
                    <Route path="/admin/employees" element={
                        <ProtectedRoute adminOnly><AdminEmployees /></ProtectedRoute>
                    } />
                    <Route path="/admin/employees" element={
                        <ProtectedRoute adminOnly><AdminEmployees /></ProtectedRoute>
                    } />
                    <Route path="/admin/orders/:orderId" element={
                        <ProtectedRoute adminOnly employeeAllowed><OrderDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/admin/banners" element={
                        <ProtectedRoute adminOnly employeeAllowed><AdminBanners /></ProtectedRoute>
                    } />
                    <Route path="/admin/customers" element={
                        <ProtectedRoute adminOnly employeeAllowed><AdminCustomers /></ProtectedRoute>
                    } />
                    <Route path="/admin/customers/:customerId" element={
                        <ProtectedRoute adminOnly employeeAllowed><AdminCustomerDetail /></ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                        <ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>
                    } />
                    <Route path="/admin/popups" element={
                        <ProtectedRoute adminOnly><AdminPopups /></ProtectedRoute>
                    } />
                    <Route path="/admin/stores" element={
                        <ProtectedRoute adminOnly><AdminStores /></ProtectedRoute>
                    } />
                    <Route path="/favorites" element={
                        <ProtectedRoute><FavoritesPage /></ProtectedRoute>
                    } />
                    <Route path="/admin/reports" element={
                        <ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>
                    } />
                    <Route path="/contact" element={<ContactPage />} />
                </Routes>
            </div>
            {!hideFooter && <Footer />}
        </>
    );
}

export default App;