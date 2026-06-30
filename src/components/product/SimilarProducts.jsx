import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { optimizedImage } from '../../utils/imageUtils';
import StarRating from '../common/StarRating';
import PriceDisplay from '../common/PriceDisplay';

const SimilarProducts = ({ similarProducts, reviewsEnabled }) => {
    const { t } = useTranslation();

    if (!similarProducts || similarProducts.length === 0) return null;

    return (
        <div className="mt-12 border-t border-gray-200 pt-10">
            <h2 className="text-xl font-black uppercase tracking-tight text-black mb-6">
                {t('product.mayAlsoLike')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
                {similarProducts.map(sp => (
                    <Link key={sp.id} to={`/products/${sp.id}`} className="group">
                        <div className="bg-gray-100 aspect-square flex items-center justify-center mb-3 overflow-hidden">
                            {sp.imageUrl ? (
                                <img
                                    src={optimizedImage(sp.imageUrl, { width: 500 })}
                                    alt={sp.name}
                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">{t('common.noImage')}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">
                                {sp.categoryName || t('product.uncategorized')}
                            </p>
                            <h3 className="text-sm font-semibold text-black mb-1 truncate">
                                {sp.name}
                            </h3>

                            {reviewsEnabled && (
                                <StarRating
                                    rating={sp.averageRating || 0}
                                    count={sp.ratingCount || 0}
                                    size="sm"
                                />
                            )}

                            <div className="mt-1">
                                <PriceDisplay
                                    price={sp.price}
                                    discountPrice={sp.discountPrice}
                                    discountPercentage={sp.discountPercentage}
                                    size="md"
                                />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SimilarProducts;