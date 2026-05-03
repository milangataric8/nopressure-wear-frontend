import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

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
                </div>
            </div>
        </div>
    );
};

export default LoginPage;