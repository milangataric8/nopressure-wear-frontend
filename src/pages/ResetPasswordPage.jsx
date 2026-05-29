import axiosInstance from '../api/axiosInstance';

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordStrength from "../components/common/PasswordStrength.jsx";
import {isPasswordValid} from "../utils/passwordUtils.js";
import { useTranslation } from 'react-i18next';

const ResetPasswordPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            toast.error('Invalid reset link');
            navigate('/login');
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid(formData.newPassword)) {
            toast.error(t('messages.passwordNotMeet'));
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error(t('auth.passwordsNoMatch'));
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/auth/reset-password', {
                token,
                newPassword: formData.newPassword,
            });
            toast.success(t('messages.passwordChanged'));
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-black mb-1">Reset Password</h1>
                    <p className="text-sm text-gray-500">Enter your new password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                            {t('profile.newPassword')}
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none
                                         focus:border-black transition-colors"
                            placeholder="••••••••"
                            required
                        />
                        <PasswordStrength password={formData.newPassword} />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                            {t('profile.confirmNewPassword')}
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                            placeholder="••••••••"
                            required
                        />
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">{t('auth.passwordsNoMatch')}</p>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <p className="text-xs text-green-600 mt-1">✓ {t('auth.passwordsMatch')}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p className="text-sm text-gray-500 mt-6 text-center">
                    <Link to="/login" className="text-black font-semibold hover:underline">
                        {t('auth.signIn')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;