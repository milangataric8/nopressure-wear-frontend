import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { getCart } from './api/cartApi';
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

function App() {
    const { user, isAuthenticated, setCartCount } = useAuth();

    useEffect(() => {
        const initCart = async () => {
            if (isAuthenticated() && user?.id) {
                try {
                    const response = await getCart(user.id);
                    setCartCount(response.data.items.length);
                } catch (e) {
                    console.log('We have a problem with cart, error: ' + e.message || 'Unknown error');
                }
            }
        };
        initCart();
    }, [user?.id]);

    return (
        <>
            <Navbar />
            <div className="pt-4">
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
                </Routes>
            </div>
            <Footer />
        </>
    );
}

export default App;