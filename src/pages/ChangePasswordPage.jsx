import axiosInstance from '../api/axiosInstance';

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { validatePassword } from '../utils/validatePassword';
import { applyServerErrors } from '../utils/validationUtils';
import { adminLandingPath } from '../utils/roles';
import FormField from '../components/form/FormField';
import PasswordInput from '../components/form/PasswordInput';
import { inputClass } from '../components/form/inputStyles';
import { useFormValidation } from '../hooks/useFormValidation';
import { required, matches, differentFrom } from '../utils/validators';
import StoreLogo from "../components/StoreLogo.jsx";
import {getSettingsMap} from "../api/settingsApi.js";

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

const newPasswordRule = (v) => validatePassword(v, { required: true });

const rules = {
    currentPassword: [required],
    newPassword: [newPasswordRule, differentFrom(all => all.currentPassword)],
    confirmPassword: [required, matches(all => all.newPassword)],
};

const ChangePasswordPage = () => {
    const { t } = useTranslation();
    const { user, logoutUser, completeForcedPasswordChange } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const form = useFormValidation(EMPTY, rules);
    const [logoUrl, setLogoUrl] = useState('');
    const [storeName, setStoreName] = useState('NoPressure');

    const forced = !!user?.passwordChangeRequired;
    const allFilled = form.values.currentPassword && form.values.newPassword && form.values.confirmPassword;

    const handleSignOut = () => {
        logoutUser();
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        let cancelled = false;
        getSettingsMap().then(r => {
            if (cancelled) return;
            if (r.data.store_name) setStoreName(r.data.store_name);
            if (r.data.store_logo_url) setLogoUrl(r.data.store_logo_url);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.submit()) return;

        setLoading(true);
        try {
            const res = await axiosInstance.post('/auth/change-password', {
                currentPassword: form.values.currentPassword,
                newPassword: form.values.newPassword,
                confirmPassword: form.values.confirmPassword,
            });

            // Every password change invalidates the previous token.
            completeForcedPasswordChange(res.data?.token);

            if (forced) {
                toast.success(t('messages.passwordChanged'));
                navigate(adminLandingPath(user), { replace: true });
                return;
            }

            toast.success(t('messages.passwordChanged'));
            navigate('/profile');
        } catch (error) {
            if (applyServerErrors(error, t, form.setErrors)) {
                // inline
            } else {
                const msg = error.response?.data?.message || '';
                if (msg.toLowerCase().includes('current password')) {
                    form.setErrors({ currentPassword: t('validation.currentPasswordWrong') });
                } else {
                    toast.error(msg || t('messages.failedToSave'));
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const fields = (
        <>
            <FormField id="currentPassword" name="currentPassword" label={t('profile.currentPassword')} required error={form.errors.currentPassword}>
                <PasswordInput
                    id="currentPassword" name="currentPassword"
                    value={form.values.currentPassword}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    aria-invalid={!!form.errors.currentPassword}
                    aria-describedby={form.errors.currentPassword ? 'currentPassword-error' : undefined}
                    className={inputClass(!!form.errors.currentPassword)}
                />
            </FormField>

            <FormField id="newPassword" name="newPassword" label={t('profile.newPassword')} required error={form.errors.newPassword} hint={forced ? t('profile.minChars') : undefined}>
                <PasswordInput
                    id="newPassword" name="newPassword"
                    value={form.values.newPassword}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    aria-invalid={!!form.errors.newPassword}
                    aria-describedby={form.errors.newPassword ? 'newPassword-error' : undefined}
                    className={inputClass(!!form.errors.newPassword)}
                />
            </FormField>

            <FormField id="confirmPassword" name="confirmPassword" label={t('profile.confirmNewPassword')} required error={form.errors.confirmPassword}>
                <PasswordInput
                    id="confirmPassword" name="confirmPassword"
                    value={form.values.confirmPassword}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    aria-invalid={!!form.errors.confirmPassword}
                    aria-describedby={form.errors.confirmPassword ? 'confirmPassword-error' : undefined}
                    className={inputClass(!!form.errors.confirmPassword)}
                />
            </FormField>
        </>
    );

    if (forced) {
        return (
            <div className="min-h-screen flex items-start justify-center px-8 py-16">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <StoreLogo logoUrl={logoUrl} storeName={storeName} className={"h-12 w-auto object-contain"} />
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-black mb-3 uppercase tracking-wide">
                            {t('profile.forcedTitle')}
                        </h1>
                        <p className="text-sm text-gray-500">{t('profile.forcedDescription')}</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        {fields}

                        <button
                            type="submit"
                            disabled={loading || !allFilled}
                            className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('common.loading') : t('profile.saveAndContinue')}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
                        >
                            {t('nav.signOut')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-6 py-10">
            <button
                onClick={() => navigate('/profile')}
                className="text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-black transition-colors mb-8"
            >
                {t('address.backToProfile')}
            </button>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-black mb-1">{t('profile.changePassword')}</h1>
                <p className="text-sm text-gray-500">Enter your current and new password</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {fields}

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
