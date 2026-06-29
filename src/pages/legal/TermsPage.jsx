import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LegalPage from '../../components/legal/LegalPage';
import { getLegalContent } from '../../api/legalApi';
import Seo from '../../components/seo/Seo';

const TermsPage = () => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(null);

    useEffect(() => {
        getLegalContent('TERMS', i18n.language)
            .then(r => setData(r.data))
            .catch(() => {});
    }, [i18n.language]);

    const lastUpdated = data?.lastUpdated
        ? new Date(data.lastUpdated).toLocaleDateString()
        : null;

    return (
        <LegalPage title={t('legal.termsTitle')} lastUpdated={lastUpdated}>
            <Seo title={t('legal.termsTitle')} url={`${window.location.origin}/terms`} />
            {data?.content
                ? <div dangerouslySetInnerHTML={{ __html: data.content }} />
                : <p className="text-gray-400 text-sm">{t('common.loading')}</p>
            }
        </LegalPage>
    );
};

export default TermsPage;
