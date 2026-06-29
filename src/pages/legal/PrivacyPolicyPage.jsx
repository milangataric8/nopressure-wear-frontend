import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LegalPage from '../../components/legal/LegalPage';
import { getLegalContent } from '../../api/legalApi';
import Seo from '../../components/seo/Seo';

const PrivacyPolicyPage = () => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(null);

    useEffect(() => {
        getLegalContent('PRIVACY', i18n.language)
            .then(r => setData(r.data))
            .catch(() => {});
    }, [i18n.language]);

    const lastUpdated = data?.lastUpdated
        ? new Date(data.lastUpdated).toLocaleDateString()
        : null;

    return (
        <LegalPage title={t('legal.privacyTitle')} lastUpdated={lastUpdated}>
            <Seo title={t('legal.privacyTitle')} url={`${window.location.origin}/privacy-policy`} />
            {data?.content
                ? <div dangerouslySetInnerHTML={{ __html: data.content }} />
                : <p className="text-gray-400 text-sm">{t('common.loading')}</p>
            }
        </LegalPage>
    );
};

export default PrivacyPolicyPage;
