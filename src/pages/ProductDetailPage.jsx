import { useState, useEffect, useCallback, useContext } from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductById } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { useAuth } from '../hooks/useAuth';
import { GuestCartContext } from '../context/GuestCartContext';
import { getImageUrl } from '../utils/imageUtils';
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useTranslation } from 'react-i18next';
import { getStoresForProduct } from '../api/storeApi';
import { getSettingsMap } from '../api/settingsApi';
import { checkFavorite, toggleFavorite } from '../api/favoriteApi';
import {getReviews, addReview, deleteReview} from '../api/reviewApi';
import { getSimilarProducts } from '../api/productApi';
import StarRating from '../components/common/StarRating';
import PriceDisplay from '../components/common/PriceDisplay';
import ProductReviews from "../components/product/ProductReviews.jsx";
import { getColorVariants } from '../api/productApi';
import ProductDescription from "../components/product/ProductDescription.jsx";
import SimilarProducts from "../components/product/SimilarProducts.jsx";
import FindInStore from "../components/product/FindInStore.jsx";
import ProductColorVariants from "../components/product/ProductColorVariants.jsx";

const ProductDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, setCartCount, cartCount, setFavoriteCount } = useAuth();
    const { addToGuestCart } = useContext(GuestCartContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [setSelectedImageIndex] = useState(0);
    const [showFindInStore, setShowFindInStore] = useState(false);
    const [productStores, setProductStores] = useState([]);
    const [findInStoreEnabled, setFindInStoreEnabled] = useState(false);
    const [favoritesEnabled, setFavoritesEnabled] = useState(true);
    const [reviewsEnabled, setReviewsEnabled] = useState(true);
    const [addToCartEnabled, setAddToCartEnabled] = useState(true);
    const [storesLoading, setStoresLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [openSection, setOpenSection] = useState('description');
    const [similarProducts, setSimilarProducts] = useState([]);
    const [setVariants] = useState([]);

    const fetchProduct = useCallback(async () => {
        try {
            const response = await getProductById(id);
            setProduct(response.data);
            setSelectedSize(null);
            setQuantity(1);
            if (response.data.images && response.data.images.length > 0) {
                setSelectedImage(response.data.images[0].imageUrl);
            } else {
                setSelectedImage(response.data.imageUrl);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.productNotFound'));
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
            setFavoritesEnabled(r.data.favorites_enabled !== 'false');
            setReviewsEnabled(r.data.reviews_enabled !== 'false');
            setAddToCartEnabled(r.data.add_to_cart_enabled !== 'false');
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (isAuthenticated() && user?.id && product?.id) {
            checkFavorite(user.id, product.id)
                .then(r => setIsFavorited(r.data.favorited))
                .catch(() => {});
        }
    }, [product?.id, user?.id]);

    useEffect(() => {
        if (product?.id) {
            getReviews(product.id)
                .then(r => setReviews(r.data))
                .catch(() => {});
        }
    }, [product?.id]);

    useEffect(() => {
        if (product?.id) {
            getSimilarProducts(product.id, 4)
                .then(r => setSimilarProducts(r.data))
                .catch(() => {});
        }
    }, [product?.id]);

    useEffect(() => {
        if (product?.id) {
            getColorVariants(product.id).then(r => setVariants(r.data)).catch(() => {});
        }
    }, [product?.id]);

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
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoadStores'));
        } finally {
            setStoresLoading(false);
        }
    };

    const selectedVariant = selectedSize && product?.variants
        ? product.variants.find(v => v.size === selectedSize)
        : null;

    const handleAddToCart = async () => {
        if (!selectedSize) {
            toast.error(t('product.selectSizeFirst'));
            return;
        }
        if (!isAuthenticated()) {
            addToGuestCart(product, quantity, selectedSize);
            toast.success(t('messages.addedToCart'));
            return;
        }
        setAddingToCart(true);
        try {
            await addToCart(user.id, { productId: product.id, quantity, size: selectedSize });
            setCartCount(cartCount + quantity);
            toast.success(t('messages.addedToCart'));
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToAddToCart'));
        } finally {
            setAddingToCart(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated()) {
            toast.info(t('messages.signInFirst'));
            navigate('/login');
            return;
        }
        try {
            const response = await toggleFavorite(user.id, product.id);
            setIsFavorited(response.data.favorited);
            setFavoriteCount(response.data.count);
            toast.success(response.data.favorited ? t('messages.addedToFavorites') : t('messages.removedFromFavorites'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdateFavorites'));
        }
    };

    const allImages = product ? [
        ...(product.imageUrl ? [{ id: 'main', imageUrl: product.imageUrl, isPrimary: true }] : []),
        ...(product.images || [])
    ] : [];

    const toggleSection = (section) => {
        setOpenSection(prev => prev === section ? null : section);
    };

    const handleSubmitReview = async () => {
        if (!isAuthenticated()) {
            toast.info(t('review.signInToReview'));
            navigate('/login');
            return;
        }
        if (myRating === 0) {
            toast.error(t('review.selectRating'));
            return;
        }
        setSubmittingReview(true);
        try {
            await addReview(product.id, user.id, { rating: myRating, comment: myComment });
            setMyRating(0);
            setMyComment('');
            const updated = await getReviews(product.id);
            setReviews(updated.data);
            const prodResponse = await getProductById(product.id);
            setProduct(prodResponse.data);
        } catch (error) {
            toast.error(error.response?.data?.message || t('review.failedToSubmit'));
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReview(reviewId, user.id);
            toast.success(t('review.reviewDeleted'));
            const updated = await getReviews(product.id);
            setReviews(updated.data);
            const prodResponse = await getProductById(product.id);
            setProduct(prodResponse.data);
        } catch (e) {
            toast.error(e.response?.data?.message || t('review.failedToDelete'));
        }
    };

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
                            <span className="text-gray-400 text-sm">{t('common.noImage')}</span>
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
                        {product.categoryName || t('product.uncategorized')}
                    </p>

                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-black uppercase tracking-tight text-black">
                            {product.name}
                        </h1>
                        {favoritesEnabled && (
                            <button
                                onClick={handleToggleFavorite}
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill={isFavorited ? '#000000' : 'none'}
                                     stroke="#000000"
                                     strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    {reviewsEnabled &&
                        <div className="mb-4">
                            <StarRating
                                rating={product.averageRating || 0}
                                count={product.ratingCount || 0}
                                size="md"
                            />
                        </div>
                    }

                    <p className="text-xs text-gray-400 mb-6">
                        {t('product.productCode')}: {product.sku}
                    </p>

                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                        <PriceDisplay
                            price={product.price}
                            discountPrice={product.discountPrice}
                            discountPercentage={product.discountPercentage}
                            size="lg"
                        />
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                            (product.totalStock ?? product.stockQuantity) > 0 ? 'text-green-600' : 'text-red-500'
                        }`}>
                            {(product.totalStock ?? product.stockQuantity) > 0
                                ? t('product.inStockCount', { count: product.totalStock ?? product.stockQuantity })
                                : t('product.soldOut')}
                        </span>
                    </div>

                    {/* Color variants */}
                    {product.colorVariants && product.colorVariants.length > 0 && (
                        <ProductColorVariants product={product} />
                    )}

                    {/* Size selector */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-6">
                            <span className="text-xs font-semibold uppercase tracking-wide text-black block mb-3">
                                {t('product.size')}
                            </span>
                            <div className="flex gap-2 flex-wrap">
                                {product.variants.map(v => (
                                    <button
                                        key={v.size}
                                        onClick={() => {
                                            if (v.inStock) {
                                                setSelectedSize(v.size);
                                                setQuantity(1);
                                            }
                                        }}
                                        disabled={!v.inStock}
                                        className={`w-14 h-10 text-sm font-semibold border transition-colors ${
                                            selectedSize === v.size
                                                ? 'border-black bg-black text-white'
                                                : v.inStock
                                                    ? 'border-gray-300 text-black hover:border-black'
                                                    : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                                        }`}
                                    >
                                        {v.size}
                                    </button>
                                ))}
                            </div>
                            {!selectedSize && (
                                <p className="text-xs text-gray-400 mt-2">{t('product.selectSizePrompt')}</p>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    {selectedVariant?.inStock && (
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
                                    onClick={() => setQuantity(q => Math.min(selectedVariant.stockQuantity, q + 1))}
                                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {addToCartEnabled ? (
                        <button
                            onClick={handleAddToCart}
                            disabled={(product.totalStock ?? product.stockQuantity) === 0 || !selectedSize || addingToCart}
                            className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-4 hover:bg-gray-800 transition-colors disabled:opacity-30"
                        >
                            {(product.totalStock ?? product.stockQuantity) === 0
                                ? t('product.soldOut')
                                : !selectedSize
                                    ? t('product.selectSizeFirst')
                                    : addingToCart
                                        ? t('product.adding')
                                        : t('product.addToCart')}
                        </button>
                    ) : (
                        <button
                            disabled
                            className="w-full bg-gray-200 text-gray-400 text-sm font-semibold uppercase tracking-wide py-4 cursor-not-allowed"
                        >
                            {t('product.addToCart')}
                        </button>
                    )}

                    {findInStoreEnabled && (
                        <FindInStore
                            storesLoading={storesLoading}
                            showFindInStore={showFindInStore}
                            productStores={productStores}
                            onFindInStore={handleFindInStore}
                        />
                    )}

                    {product.material && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-8">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('product.material')}:</span>
                            <span>{product.material}</span>
                        </div>
                    )}

                    {product.gender && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('product.gender')}:</span>
                            <span>{t(`product.gender${product.gender.charAt(0) + product.gender.slice(1).toLowerCase()}`)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                {product.description && (
                    <ProductDescription
                        description={product.description}
                        isOpen={openSection === 'description'}
                        onToggle={() => toggleSection('description')}
                    />
                )}
                {/* Reviews */}
                {reviewsEnabled && <div className=" border-t border-gray-200">
                    <button
                        onClick={() => toggleSection('reviews')}
                        className="w-full flex items-center justify-between py-4 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-black">{t('review.reviews')}</span>
                            {reviews.length > 0 && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                                            {reviews.length}
                                        </span>
                            )}
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18" height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className={`transition-transform duration-200 ${openSection === 'reviews' ? 'rotate-90' : ''}`}
                        >
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>

                    {openSection === 'reviews' && (
                        <ProductReviews
                            reviews={reviews}
                            isAuthenticated={isAuthenticated}
                            user={user}
                            myRating={myRating}
                            setMyRating={setMyRating}
                            myComment={myComment}
                            setMyComment={setMyComment}
                            submittingReview={submittingReview}
                            onSubmitReview={handleSubmitReview}
                            onDeleteReview={handleDeleteReview}
                        />
                    )}
                </div>
                }
            </div>

            {similarProducts.length > 0 && (
                <SimilarProducts similarProducts={similarProducts} reviewsEnabled={reviewsEnabled} />
            )}
        </div>
    );
};

export default ProductDetailPage;