import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../utils/imageUtils';

const ProductColorVariants = ({ product }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!product.colorVariants || product.colorVariants.length === 0) return null;

    return (
        <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-black mb-3">
                {t('product.availableColors')}
            </p>
            <div className="flex gap-2 flex-wrap">
                {/* Current product */}
                <div className="relative">
                    <div className="w-16 h-16 border-2 border-black overflow-hidden">
                        {product.imageUrl ? (
                            <img
                                src={getImageUrl(product.imageUrl)}
                                alt={product.colorName || product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100" />
                        )}
                    </div>
                </div>

                {/* Variants */}
                {product.colorVariants.map(variant => (
                    <div key={variant.productId}>
                        <button
                            onClick={() => navigate(`/products/${variant.productId}`)}
                            className="w-16 h-16 border-2 border-transparent hover:border-black transition-colors overflow-hidden block"
                        >
                            {variant.imageUrl ? (
                                <img
                                    src={getImageUrl(variant.imageUrl)}
                                    alt={variant.colorName || 'Variant'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full"
                                    style={{ backgroundColor: variant.colorHex || '#ccc' }}
                                />
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductColorVariants;