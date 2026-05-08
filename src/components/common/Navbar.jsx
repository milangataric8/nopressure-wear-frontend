import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const Navbar = () => {
    const { user, logoutUser, isAuthenticated, isAdmin, isEmployee, cartCount } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16 relative">
                    {/* Logo */}
                    <Link to="/" className="text-xl font-black tracking-tight text-black uppercase">
                        WebShop
                    </Link>

                    {/* Links */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
                        <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                            Products
                        </Link>
                        {isAuthenticated() && (
                            <>
                                <Link to="/cart" className="text-sm font-medium text-gray-600 hover:text-black transition-colors relative">
                                    Cart
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-4 bg-black text-white text-xs font-bold w-4 h-4 flex items-center justify-center">
                            {cartCount}
                        </span>
                                    )}
                                </Link>
                                <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                                    Orders
                                </Link>
                            </>
                        )}
                        {(isAdmin() || isEmployee()) && (
                            <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Auth */}
                    <div className="flex items-center gap-4 mr-0">
                        {isAuthenticated() ? (
                            <>
                                <Link to="/profile" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                                    {user?.firstName} {user?.lastName}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-black text-white text-sm font-medium px-5 py-2 hover:bg-gray-800 transition-colors"
                                >
                                    Join Us
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;