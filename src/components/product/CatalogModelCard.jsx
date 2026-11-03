import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { optimizedImage } from '../../utils/imageUtils';
import PriceDisplay from '../common/PriceDisplay';
import StarRating from '../common/StarRating';

export default function CatalogModelCard({ model, reviewsEnabled }) {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState(null);
    const options = model.options || [];
    const product = options.find(option => option.id === selectedId) || options[0];
    if (!product) return null;
    const url = '/products/' + product.id;
    return (
        <article className="min-w-0">
            <Link to={url} className="group block">
                <div className="bg-white aspect-square flex items-center justify-center mb-3 overflow-hidden">
                    {product.imageUrl ? <img src={optimizedImage(product.imageUrl, { width: 500 })}
                        alt={[product.name, product.colorName].filter(Boolean).join(' — ')}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        : <span className="text-gray-400 text-xs">{t('common.noImage')}</span>}
                </div>
                <p className="text-xs text-gray-500 mb-0.5">{product.categoryName || t('product.uncategorized')}</p>
                <h3 className="text-sm font-semibold text-black mb-1">{product.name}</h3>
            </Link>
            <div className="flex flex-wrap gap-0.5 sm:gap-1 my-2" role="group" aria-label={t('product.color')}>
                {options.map(option => <button key={option.id} type="button"
                    onClick={() => setSelectedId(option.id)} aria-pressed={option.id === product.id}
                    aria-label={option.colorName || option.name} title={option.colorName || option.name}
                    className="w-7 sm:w-9 h-9 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
                    <span className={'block w-5 h-5 rounded-full border border-gray-300 ' + (option.id === product.id ? 'ring-1 ring-black ring-offset-2' : '')}
                        style={{ backgroundColor: option.colorHex || '#cccccc' }} />
                </button>)}
            </div>
            <p className="text-xs text-gray-500 mb-2" aria-live="polite">{product.colorName}</p>
            <Link to={url} className="block">
                <div className="flex flex-wrap items-center justify-between gap-1">
                    <PriceDisplay price={product.price} discountPrice={product.discountPrice}
                        discountPercentage={product.discountPercentage} size="md" />
                    <span className={'text-xs ' + ((product.totalStock ?? product.stockQuantity) > 0 ? 'text-green-600' : 'text-red-500')}>
                        {(product.totalStock ?? product.stockQuantity) > 0 ? t('product.inStock') : t('product.soldOut')}
                    </span>
                </div>
                {reviewsEnabled && <StarRating rating={product.averageRating || 0} count={product.ratingCount || 0} size="sm" />}
            </Link>
        </article>
    );
}
