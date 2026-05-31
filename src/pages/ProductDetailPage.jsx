import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductById } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { useAuth } from '../hooks/useAuth';
import { getImageUrl } from '../utils/imageUtils';
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useTranslation } from 'react-i18next';
import { getStoresForProduct } from '../api/storeApi';
import { getSettingsMap } from '../api/settingsApi';

const ProductDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, setCartCount, cartCount } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [, setSelectedImageIndex] = useState(0);
    const [showFindInStore, setShowFindInStore] = useState(false);
    const [productStores, setProductStores] = useState([]);
    const [findInStoreEnabled, setFindInStoreEnabled] = useState(false);
    const [storesLoading, setStoresLoading] = useState(false);

    const fetchProduct = useCallback(async () => {
        try {
            const response = await getProductById(id);
            setProduct(response.data);
            if (response.data.images && response.data.images.length > 0) {
                setSelectedImage(response.data.images[0].imageUrl);
            } else {
                setSelectedImage(response.data.imageUrl);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Product not found');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        getSettingsMap().then(r => {
            setFindInStoreEnabled(r.data.find_in_store_enabled !== 'false');
        }).catch(() => {});
    }, []);

    const handleFindInStore = async () => {
        if (showFindInStore) {
            setShowFindInStore(false);
            return;
        }
        setStoresLoading(true);
        try {
            const response = await getStoresForProduct(product.id);
            setProductStores(response.data);
            setShowFindInStore(true);
        } catch (_) {
            toast.error('Failed to load store availability');
        } finally {
            setStoresLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated()) {
            toast.info(t('messages.signInFirst'));
            navigate('/login');
            return;
        }
        setAddingToCart(true);
        try {
            await addToCart(user.id, { productId: product.id, quantity });
            setCartCount(cartCount + quantity);
            toast.success(t('messages.addedToCart'));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const allImages = product ? [
        ...(product.imageUrl ? [{ id: 'main', imageUrl: product.imageUrl, isPrimary: true }] : []),
        ...(product.images || [])
    ] : [];

    {loading && <LoadingSpinner />}
    {loading && <LoadingSpinner height="h-32" />}

    if (!product) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <button
                onClick={() => navigate('/products')}
                className="text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-black transition-colors mb-8"
            >
                {t('product.backToProducts')}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Images */}
                <div>
                    {/* Main image */}
                    <div className="bg-gray-100 aspect-square flex items-center justify-center overflow-hidden mb-3">
                        {selectedImage ? (
                            <img
                                src={getImageUrl(selectedImage)}
                                alt={product.name}
                                className="w-full h-full object-contain p-4"
                            />
                        ) : (
                            <span className="text-gray-400 text-sm">No image</span>
                        )}
                    </div>

                    {/* Video */}
                    {product.videoUrl && (
                        <div className="mb-3">
                            <video
                                src={getImageUrl(product.videoUrl)}
                                controls
                                className="w-full"
                            />
                        </div>
                    )}

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {allImages.map((img, index) => (
                                <button
                                    key={img.id}
                                    onClick={() => {
                                        setSelectedImage(img.imageUrl);
                                        setSelectedImageIndex(index);
                                    }}
                                    className={`w-16 h-16 bg-gray-100 overflow-hidden flex-shrink-0 border-2 transition-colors ${
                                        selectedImage === img.imageUrl
                                            ? 'border-black'
                                            : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <img
                                        src={getImageUrl(img.imageUrl)}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-contain p-1"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col justify-start">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                        {product.categoryName || 'Uncategorized'}
                    </p>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                        {product.name}
                    </h1>
                    <p className="text-xs text-gray-400 mb-6">
                        {t('product.productCode')}: {product.sku}
                    </p>

                    <p className="text-sm text-gray-600 leading-relaxed mb-8">
                        {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                        <span className="text-2xl font-bold text-black">
                            ${product.price}
                        </span>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                            product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'
                        }`}>
                            {product.stockQuantity > 0
                                ? `${product.stockQuantity} in stock`
                                : t('product.soldOut')}
                        </span>
                    </div>

                    {/* Color variants */}
                    {product.colorVariants && product.colorVariants.length > 0 && (
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
                                    <div key={variant.variantId}>
                                        <button
                                            onClick={() => navigate(`/products/${variant.variantId}`)}
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
                    )}

                    {/* Quantity */}
                    {product.stockQuantity > 0 && (
                        <div className="flex items-center gap-6 mb-6">
                            <span className="text-xs font-semibold uppercase tracking-wide text-black">
                                {t('product.quantity')}
                            </span>
                            <div className="flex items-center border border-gray-300">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
                                >
                                    −
                                </button>
                                <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-black border-x border-gray-300">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stockQuantity === 0 || addingToCart}
                        className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-4 hover:bg-gray-800 transition-colors disabled:opacity-30"
                    >
                        {addingToCart ? t('product.adding') : t('product.addToCart')}
                    </button>

                    {/* Find in Store */}
                    {findInStoreEnabled && (
                        <>
                            <button
                                onClick={handleFindInStore}
                                disabled={storesLoading}
                                className="w-full mt-3 border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {storesLoading ? 'Loading...' : showFindInStore ? 'Hide Stores' : 'Find in Store'}
                            </button>

                            {showFindInStore && (
                                <div className="mt-4 border border-gray-200">
                                    {productStores.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <p className="text-sm text-gray-400">Not available in any store</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Available in {productStores.length} {productStores.length === 1 ? 'store' : 'stores'}
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
                                                        t('product.inStock')
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;