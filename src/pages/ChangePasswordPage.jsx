import axiosInstance from '../api/axiosInstance';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { isPasswordValid } from '../utils/passwordUtils';
import { inputNormal, inputError, applyServerErrors, focusFirstError } from '../utils/validationUtils';

const ChangePasswordPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const e = {};
        if (!formData.currentPassword) e.currentPassword = t('validation.currentPasswordRequired');
        if (!formData.newPassword) e.newPassword = t('validation.newPasswordRequired');
        else if (!isPasswordValid(formData.newPassword)) e.newPassword = t('messages.passwordNotMeet');
        if (!formData.confirmPassword) e.confirmPassword = t('validation.passwordRequired');
        else if (formData.newPassword !== formData.confirmPassword) e.confirmPassword = t('auth.passwordsNoMatch');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            focusFirstError();
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
            if (applyServerErrors(error, t, setErrors)) {
                // inline
            } else {
                const msg = error.response?.data?.message || '';
                if (msg.toLowerCase().includes('current password')) {
                    setErrors({ currentPassword: t('validation.currentPasswordWrong') });
                    focusFirstError();
                } else {
                    toast.error(msg || 'Failed to change password');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border px-4 py-2.5 text-sm focus:outline-none transition-colors";
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

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                    <label className={labelClass} htmlFor="currentPassword">{t('profile.currentPassword')}</label>
                    <input
                        id="currentPassword"
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        aria-invalid={!!errors.currentPassword}
                        aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
                        className={`${inputClass} ${errors.currentPassword ? inputError : inputNormal}`}
                        placeholder="••••••••"
                    />
                    {errors.currentPassword && (
                        <p id="currentPassword-error" className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass} htmlFor="newPassword">{t('profile.newPassword')}</label>
                    <input
                        id="newPassword"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        aria-invalid={!!errors.newPassword}
                        aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                        className={`${inputClass} ${errors.newPassword ? inputError : inputNormal}`}
                        placeholder="••••••••"
                    />
                    {errors.newPassword && (
                        <p id="newPassword-error" className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass} htmlFor="confirmPassword">{t('profile.confirmNewPassword')}</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                        className={`${inputClass} ${errors.confirmPassword ? inputError : inputNormal}`}
                        placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                        <p id="confirmPassword-error" className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
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
