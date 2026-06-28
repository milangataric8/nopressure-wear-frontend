import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CookieBanner = () => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('np_cookie_consent')) setVisible(true);
    }, []);

    const decide = (accepted) => {
        localStorage.setItem('np_cookie_consent', accepted ? 'accepted' : 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-black text-white px-6 py-4 flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs flex-1">
                {t('cookie.message')}{' '}
                <Link to="/privacy-policy" className="underline">{t('cookie.learnMore')}</Link>
            </p>
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={() => decide(false)}
                    className="text-xs border border-white px-4 py-2 uppercase tracking-wide hover:bg-white hover:text-black transition-colors"
                >
                    {t('cookie.decline')}
                </button>
                <button
                    onClick={() => decide(true)}
                    className="text-xs bg-white text-black px-4 py-2 uppercase tracking-wide font-semibold hover:bg-gray-200 transition-colors"
                >
                    {t('cookie.accept')}
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
