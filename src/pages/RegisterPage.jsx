import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../api/authApi';
import PasswordStrength from "../components/common/PasswordStrength.jsx";
import {isPasswordValid} from "../utils/passwordUtils.js";
import { useTranslation } from 'react-i18next';
import AuthBackground from "../components/auth/AuthBackground.jsx";
import { getSettingsMap } from '../api/settingsApi';

const RegisterPage = () => {
    const { t } = useTranslation();
    const [registrationEnabled, setRegistrationEnabled] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getSettingsMap().then(r => {
            setRegistrationEnabled(r.data.registration_enabled !== 'false');
        }).catch(() => {});
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid(formData.password)) {
            toast.error(t('messages.passwordNotMeet'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error(t('auth.passwordsNoMatch'));
            return;
        }

        setLoading(true);
        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            });
            toast.success(t('messages.registerSuccess'));
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-300 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-2";

    if (!registrationEnabled) {
        return (
            <div className="min-h-screen flex">
                <AuthBackground />
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-sm text-center">
                        <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-3">
                            {t('auth.registrationClosedTitle')}
                        </h1>
                        <p className="text-sm text-gray-500 mb-6">{t('auth.registrationClosed')}</p>
                        <Link to="/login" className="text-black font-semibold hover:underline text-sm">
                            {t('auth.signIn')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side */}
            <AuthBackground />

            {/* Right side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
                <div className="w-full max-w-sm">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-black mb-1">{t('auth.register')}</h2>
                        <p className="text-sm text-gray-500">{t('auth.registerSubtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>{t('auth.firstName')}</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Mirko"
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('auth.lastName')}</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Kopanja"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>{t('auth.email')}</label>
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
                            <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                                {t('auth.password')}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none
                                         focus:border-black transition-colors"
                                placeholder="••••••••"
                                required
                            />
                            <PasswordStrength password={formData.password} />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                                {t('auth.confirmPassword')}
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
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">{t('auth.passwordsNoMatch')}</p>
                            )}
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <p className="text-xs text-green-600 mt-1">✓ {t('auth.passwordsMatch')}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white text-sm font-semibold py-3 uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? t('common.loading') : t('auth.register')}
                        </button>
                    </form>

                    <p className="text-sm text-gray-500 mt-8">
                        {t('auth.haveAccount')}{' '}
                        <Link to="/login" className="text-black font-semibold hover:underline">
                            {t('auth.signIn')}
                        </Link>
                    </p>

                    {/* Google register */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-4 text-gray-400 uppercase tracking-wide">
                                        {t('auth.or')}
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
                            {t('auth.continueWithGoogle')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
