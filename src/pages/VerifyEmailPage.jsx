import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { verifyEmail } from '../api/authApi';

const VerifyEmailPage = () => {
    const [params] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const { t } = useTranslation();

    useEffect(() => {
        const token = params.get('token');
        if (!token) { setStatus('error'); return; }
        verifyEmail(token)
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [params]);

    return (
        <div className="max-w-md mx-auto py-20 text-center px-6">
            {status === 'loading' && (
                <p className="text-sm text-gray-500">{t('auth.verifying')}</p>
            )}
            {status === 'success' && (
                <>
                    <h1 className="text-2xl font-black uppercase tracking-tight mb-3">
                        {t('auth.verifiedTitle')}
                    </h1>
                    <p className="text-sm text-gray-500 mb-8">{t('auth.verifiedText')}</p>
                    <Link
                        to="/login"
                        className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors"
                    >
                        {t('auth.goToLogin')}
                    </Link>
                </>
            )}
            {status === 'error' && (
                <>
                    <h1 className="text-2xl font-black uppercase tracking-tight mb-3">
                        {t('auth.verifyFailedTitle')}
                    </h1>
                    <p className="text-sm text-gray-500">{t('auth.verifyFailedText')}</p>
                </>
            )}
        </div>
    );
};

export default VerifyEmailPage;
