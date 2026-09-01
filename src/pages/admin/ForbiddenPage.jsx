import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { adminLandingPath } from '../../utils/roles.js';

const ForbiddenPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Error 403
            </p>
            <h1 className="text-8xl font-black uppercase tracking-tight text-black mb-6">
                {t('forbidden.title')}
            </h1>
            <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">
                {t('forbidden.text')}
            </p>
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => navigate(adminLandingPath(user))}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors"
                >
                    {t('forbidden.back')}
                </button>
            </div>
        </div>
    );
};

export default ForbiddenPage;
