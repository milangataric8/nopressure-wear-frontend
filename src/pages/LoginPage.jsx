import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import AuthBackground from "../components/auth/AuthBackground.jsx";
import { getSettingsMap } from '../api/settingsApi';

const LoginPage = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginEnabled, setLoginEnabled] = useState(true);
    const [registrationEnabled, setRegistrationEnabled] = useState(true);
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        getSettingsMap().then(r => {
            setLoginEnabled(r.data.login_enabled !== 'false');
            setRegistrationEnabled(r.data.registration_enabled !== 'false');
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (params.get('error') === 'login_disabled') {
            toast.error(t('auth.loginDisabled'));
        }
    }, [params, t]);

    const handleChange = (e) => {
        setLoginError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(formData);
            const { id, token, firstName, lastName, email, role } = response.data;
            loginUser({ id, firstName, lastName, email, role }, token);
            navigate('/');
        } catch (error) {
            const status = error.response?.status;
            const msg = error.response?.data?.message || '';
            if (status === 403 && msg.toLowerCase().includes('verify')) {
                setLoginError(t('auth.emailNotVerified'));
            } else if (status === 403) {
                toast.error(t('auth.loginDisabled'));
            } else {
                setLoginError(t('auth.loginFailed'));
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-300 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";

    return (
        <div className="min-h-screen flex">
            {/* Left side — image/branding */}
            <AuthBackground />

            {/* Right side — form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-black mb-1">{t('auth.login')}</h2>
                        <p className="text-sm text-gray-500">{t('auth.loginSubtitle')}</p>
                    </div>

                    {!loginEnabled && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-xs text-amber-800">
                            {t('auth.loginRestricted')}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {loginError && (
                            <p className="text-xs text-red-500">{loginError}</p>
                        )}
                        <div>
                            <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-2">
                                {t('auth.email')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`${inputClass} ${loginError ? 'border-red-500' : ''}`}
                                placeholder="mirko.kopanja@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-2">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`${inputClass} ${loginError ? 'border-red-500' : ''} pr-10`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white text-sm font-semibold py-3 uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? t('common.loading') : t('auth.signIn')}
                        </button>
                    </form>

                    {registrationEnabled && (
                        <p className="text-sm text-gray-500 mt-8">
                            {t('auth.noAccount')}{' '}
                            <Link to="/register" className="text-black font-semibold hover:underline">
                                {t('nav.joinUs')}
                            </Link>
                        </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2 text-right">
                        <Link to="/forgot-password" className="text-black hover:underline text-xs">
                            {t('auth.forgotPassword')}
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

export default LoginPage;
