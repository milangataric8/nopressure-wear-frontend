import axiosInstance from '../api/axiosInstance';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const ChangePasswordPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error(t('auth.passwordsNoMatch'));
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.post(`/auth/change-password/${user.id}`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            toast.success(t('messages.passwordChanged'));
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-md mx-auto px-6 py-10">
            <button
                onClick={() => navigate('/profile')}
                className="text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-black transition-colors mb-8"
            >
                ← Back to Profile
            </button>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-black mb-1">{t('profile.changePassword')}</h1>
                <p className="text-sm text-gray-500">Enter your current and new password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClass}>{t('profile.currentPassword')}</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>{t('profile.newPassword')}</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>{t('profile.confirmNewPassword')}</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {loading ? t('common.loading') : t('profile.changePassword')}
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;