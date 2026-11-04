import { getApiErrorMessage } from '../utils/apiError.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../api/authApi';

const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email.trim());
            setSent(true);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'auth.resetEmailFailed'));
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center">
                    <h1 className="text-2xl font-bold text-black mb-4">{t('auth.checkInboxTitle')}</h1>
                    <p className="text-sm text-gray-500 mb-8">
                        {t('auth.resetEmailSent', { email: email.trim() })}
                    </p>
                    <Link
                        to="/login"
                        className="text-sm font-semibold text-black hover:underline"
                    >
                        {t('auth.signIn')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-black mb-1">{t('auth.forgotPassword')}</h1>
                    <p className="text-sm text-gray-500">
                        {t('auth.forgotPasswordSubtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                            {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? t('auth.sendingResetLink') : t('auth.sendResetLink')}
                    </button>
                </form>

                <p className="text-sm text-gray-500 mt-6 text-center">
                    {t('auth.rememberPassword')}{' '}
                    <Link to="/login" className="text-black font-semibold hover:underline">
                        {t('auth.signIn')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;