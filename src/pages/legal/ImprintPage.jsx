import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LegalPage from '../../components/legal/LegalPage';
import { getLegalContent } from '../../api/legalApi';

const ImprintPage = () => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(null);

    useEffect(() => {
        getLegalContent('IMPRINT', i18n.language)
            .then(r => setData(r.data))
            .catch(() => {});
    }, [i18n.language]);

    return (
        <LegalPage title={t('legal.imprintTitle')}>
            {data?.content
                ? <div dangerouslySetInnerHTML={{ __html: data.content }} />
                : <p className="text-gray-400 text-sm">{t('common.loading')}</p>
            }
        </LegalPage>
    );
};

export default ImprintPage;
