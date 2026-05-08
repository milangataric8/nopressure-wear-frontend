import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(formData);
            const { id, token, firstName, lastName, email, role } = response.data;
            loginUser({ id, firstName, lastName, email, role }, token);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-300 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";

    return (
        <div className="min-h-screen flex">
            {/* Left side — image/branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-100 items-center justify-center">
                <div className="text-center">
                    <h1 className="text-6xl font-black uppercase tracking-tighter text-black">Web<br/>Shop</h1>
                    <p className="text-gray-500 mt-4 text-sm">Your premium destination</p>
                </div>
            </div>

            {/* Right side — form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
                <div className="w-full max-w-sm">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-black mb-1">Sign In</h2>
                        <p className="text-sm text-gray-500">Enter your details to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white text-sm font-semibold py-3 uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-sm text-gray-500 mt-8">
                        Not a member?{' '}
                        <Link to="/register" className="text-black font-semibold hover:underline">
                            Join Us
                        </Link>
                    </p>
                    <p className="text-sm text-gray-500 mt-2 text-right">
                        <Link to="/forgot-password" className="text-black hover:underline text-xs">
                            Forgot password?
                        </Link>
                    </p>

                    {/* Google login */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-4 text-gray-400 uppercase tracking-wide">
                                        or
                                    </span>
                            </div>
                        </div>

                        <a
                            href="http://localhost:8080/oauth2/authorization/google"
                            className="mt-4 w-full flex items-center justify-center gap-3 border border-gray-300 px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18">
                                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                            </svg>
                            Continue with Google
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;