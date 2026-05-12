import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
    const { user, logoutUser, isAuthenticated, isAdmin, isEmployee, cartCount } = useAuth();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/products?search=${searchInput.trim()}`);
            setSearchInput('');
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16 relative">
                    {/* Logo — left side */}
                    <Link to="/" className="text-xl font-black tracking-tight text-black uppercase">
                        WebShop
                    </Link>

                    {/* Links — absolute center */}
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

                    {/* Right side — search + auth */}
                    <div className="flex items-center gap-4">
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
                                        className="absolute right-1 text-gray-400 hover:text-black transition-colors"
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