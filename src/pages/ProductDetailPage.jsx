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
import { checkFavorite, toggleFavorite } from '../api/favoriteApi';
import {getReviews, addReview, deleteReview} from '../api/reviewApi';
import StarRating from '../components/common/StarRating';
import useFormatPrice from '../hooks/useFormatPrice';
import PriceDisplay from "../components/common/PriceDisplay.jsx";

const ProductDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, setCartCount, cartCount, setFavoriteCount } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [, setSelectedImageIndex] = useState(0);
    const [showFindInStore, setShowFindInStore] = useState(false);
    const [productStores, setProductStores] = useState([]);
    const [findInStoreEnabled, setFindInStoreEnabled] = useState(false);
    const [favoritesEnabled, setFavoritesEnabled] = useState(true);
    const [reviewsEnabled, setReviewsEnabled] = useState(true);
    const [storesLoading, setStoresLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [openSection, setOpenSection] = useState(null);

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

                    <div className="mb-4">
                        <StarRating
                            rating={product.averageRating || 0}
                            count={product.ratingCount || 0}
                            size="md"
                        />
                    </div>

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
                            product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'
                        }`}>
                            {product.stockQuantity > 0
                                ? t('product.inStockCount', { count: product.stockQuantity })
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
                                className="w-full mt-3 border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
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
                    )}

                    {product.material && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Material:</span>
                            <span>{product.material}</span>
                        </div>
                    )}

                    {/* Accordion sections */}
                    <div className="mt-8 border-t border-gray-200">
                        {/* Description */}
                        {product.description && (
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleSection('description')}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="text-sm font-semibold text-black">{t('review.description')}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18" height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className={`transition-transform duration-200 ${openSection === 'description' ? 'rotate-90' : ''}`}
                                    >
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </button>
                                {openSection === 'description' && (
                                    <div className="pb-6">
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                            {product.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reviews */}
                        {reviewsEnabled && <div className="border-b border-gray-200">
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
                                <div className="pb-6">
                                    {/* Write review */}
                                    {isAuthenticated() && !reviews.some(r => r.userName === `${user.firstName} ${user.lastName}`) && (
                                        <div className="mb-6">
                                            <button
                                                onClick={() => setShowReviewForm(!showReviewForm)}
                                                className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
                                            >
                                                {showReviewForm ? t('review.cancelReview') : t('review.writeReview')}
                                            </button>

                                            {showReviewForm && (
                                                <div className="border border-gray-200 p-6 mt-3">
                                                    <div className="mb-3">
                                                        <StarRating
                                                            rating={myRating}
                                                            size="lg"
                                                            interactive
                                                            onRate={setMyRating}
                                                        />
                                                    </div>
                                                    <textarea
                                                        value={myComment}
                                                        onChange={(e) => setMyComment(e.target.value)}
                                                        placeholder={t('review.shareExperience')}
                                                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors mb-3"
                                                        rows={3}
                                                    />
                                                    <button
                                                        onClick={handleSubmitReview}
                                                        disabled={submittingReview || myRating === 0}
                                                        className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-30"
                                                    >
                                                        {submittingReview ? t('review.submitting') : t('review.submitReview')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Reviews list */}
                                    {reviews.length === 0 ? (
                                        <p className="text-sm text-gray-400">{t('review.noReviews')}</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map(review => (
                                                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <StarRating rating={review.rating} size="sm" />
                                                            <span className="text-xs font-semibold text-black">{review.userName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                            {isAuthenticated() && review.userName === `${user.firstName} ${user.lastName}` && (
                                                                <button
                                                                    onClick={() => handleDeleteReview(review.id)}
                                                                    className="text-xs text-red-400 hover:text-red-600 underline"
                                                                >
                                                                    {t('review.delete')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-sm text-gray-600">{review.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;