import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getProducts, getColorVariants, linkColorVariant, unlinkColorVariant } from '../../api/productApi';
import { getImageUrl } from '../../utils/imageUtils';

const ColorVariantManager = ({ productId, colorVariants, setColorVariants, inputClass }) => {
    const { t } = useTranslation();
    const [variantSearch, setVariantSearch] = useState('');
    const [variantResults, setVariantResults] = useState([]);

    const handleSearch = async (q) => {
        setVariantSearch(q);
        if (q.trim().length < 2) {
            setVariantResults([]);
            return;
        }
        try {
            const r = await getProducts({ search: q, size: 5 });
            const linkedIds = colorVariants.map(v => v.productId);
            setVariantResults(
                (r.data.content || r.data).filter(
                    p => p.id !== productId && !linkedIds.includes(p.id)
                )
            );
        } catch (_) {
            setVariantResults([]);
        }
    };

    const handleLink = async (variantId) => {
        try {
            await linkColorVariant(productId, variantId);
            const r = await getColorVariants(productId);
            setColorVariants(r.data);
            setVariantSearch('');
            setVariantResults([]);
            toast.success(t('messages.variantLinked'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLinkVariant'));
        }
    };

    const handleUnlink = async (variantId) => {
        try {
            const r = await unlinkColorVariant(productId, variantId);
            setColorVariants(r.data);
            toast.success(t('messages.variantUnlinked'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUnlinkVariant'));
        }
    };

    return (
        <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                {t('admin.colorVariants')}
            </label>
            <p className="text-xs text-gray-400 mb-3">
                {t('admin.colorVariantsDesc')}
            </p>

            {/* Linked variants */}
            <div className="flex flex-wrap gap-2 mb-3">
                {colorVariants.map(v => (
                    <div key={v.productId} className="flex items-center gap-2 border border-gray-200 px-2 py-1.5">
                        {v.colorHex && v.colorName !== 'Multi-Color' ? (
                            <span className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: v.colorHex }} />
                        ) : (
                            <span className="w-5 h-5 rounded-full border border-gray-200 bg-gray-100 flex-shrink-0" />
                        )}
                        <span className="text-xs text-black">{v.colorName || v.name}</span>
                        {v.isCurrent && <span className="text-xs text-gray-400">{t('admin.currentVariant')}</span>}
                        {!v.isCurrent && (
                            <button
                                type="button"
                                onClick={() => handleUnlink(v.productId)}
                                className="text-xs text-red-400 hover:text-red-600 ml-1"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                {colorVariants.length === 0 && (
                    <p className="text-xs text-gray-400">{t('admin.noVariantsLinked')}</p>
                )}
            </div>

            {/* Search to link a variant */}
            <div className="relative">
                <input
                    type="text"
                    value={variantSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={t('admin.searchVariantPlaceholder')}
                    className={inputClass}
                />
                {variantResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 z-20 shadow-sm max-h-48 overflow-y-auto">
                        {variantResults.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handleLink(p.id)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                                <div className="w-8 h-8 bg-gray-100 flex-shrink-0 overflow-hidden">
                                    {p.imageUrl && <img src={getImageUrl(p.imageUrl)} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-black">{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.colorName || p.sku}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorVariantManager;