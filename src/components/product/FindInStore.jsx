import { useTranslation } from 'react-i18next';

const FindInStore = ({
                         storesLoading,
                         showFindInStore,
                         productStores,
                         onFindInStore,
                     }) => {
    const { t } = useTranslation();

    return (
        <>
            <button
                onClick={onFindInStore}
                disabled={storesLoading}
                className="w-full mt-3 border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                {storesLoading ? t('common.loading') : showFindInStore ? t('product.hideStores') : t('product.findInStore')}
            </button>

            {showFindInStore && (
                <div className="mt-4 border border-gray-200">
                    {productStores.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-sm text-gray-400">{t('product.noStores')}</p>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {productStores.length === 1
                                        ? t('product.availableInStore', { count: 1 })
                                        : t('product.availableInStores', { count: productStores.length })}
                                </p>
                            </div>
                            {productStores.map(ps => (
                                <div key={ps.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="text-sm font-semibold text-black">{ps.storeName}</p>
                                        <p className="text-xs text-gray-500">{ps.storeStreet}, {ps.storeCity}</p>
                                        {ps.storePhone && (
                                            <p className="text-xs text-gray-400 mt-0.5">{ps.storePhone}</p>
                                        )}
                                        {ps.storeWorkingHours && (
                                            <p className="text-xs text-gray-400">{ps.storeWorkingHours}</p>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold uppercase px-2 py-1 bg-green-100 text-green-700">
                                        {t('product.inStock')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default FindInStore;