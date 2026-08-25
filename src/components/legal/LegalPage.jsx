import { useTranslation } from 'react-i18next';

const LegalPage = ({ title, lastUpdated, children }) => {
    const { t } = useTranslation();

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mb-2">
                {title}
            </h1>
            {lastUpdated && (
                <p className="text-xs text-gray-400 mb-8 pb-6 border-b border-gray-200">
                    {t('legal.lastUpdated', { date: lastUpdated })}
                </p>
            )}
            <div
                className="prose prose-neutral max-w-none break-words
                           prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                           prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-2
                           prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
                           prose-p:text-sm prose-p:leading-relaxed prose-p:text-gray-600
                           prose-strong:text-black prose-strong:font-semibold
                           prose-a:text-black prose-a:underline
                           prose-li:text-sm prose-li:text-gray-600"
            >
                {children}
            </div>
        </div>
    );
};

export default LegalPage;
