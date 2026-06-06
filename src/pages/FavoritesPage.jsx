import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getUserFavorites, toggleFavorite } from '../api/favoriteApi';
import { getImageUrl } from '../utils/imageUtils';
import useFormatPrice from "../hooks/useFormatPrice.js";
import PriceDisplay from "../components/common/PriceDisplay.jsx";

const FavoritesPage = () => {
    const { t } = useTranslation();
    const { user, setFavoriteCount } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const formatPrice = useFormatPrice();

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getUserFavorites(user.id);
            setFavorites(response.data);
            setFavoriteCount(response.data.length);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoadFavorites'));
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleRemove = async (productId) => {
        try {
            const response = await toggleFavorite(user.id, productId);
            setFavoriteCount(response.data.count);
            setFavorites(prev => prev.filter(f => f.productId !== productId));
            toast.success(t('messages.removedFromFavorites'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToRemoveFromFavorites'));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        {t('favorite.myFavorites')}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {favorites.length} {favorites.length === 1 ? t('product.product') : t('product.products')}
                    </p>
                </div>
                <Link
                    to="/products"
                    className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-50 transition-colors"
                >
                    {t('cart.continueShopping')}
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
            ) : favorites.length === 0 ? (
                <div className="text-center py-20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <p className="text-sm text-gray-400 mb-4">{t('favorite.noFavorites')}</p>
                    <Link
                        to="/products"
                        className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors inline-block"
                    >
                        {t('favorite.browseProducts')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {favorites.map(fav => (
                        <div key={fav.id} className="group relative">
                            {/* Remove button */}
                            <button
                                onClick={() => handleRemove(fav.productId)}
                                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white border border-gray-200 flex items-center justify-center hover:border-red-400 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>

                            <Link to={`/products/${fav.productId}`} className="block">
                                <div className="bg-gray-100 aspect-square flex items-center justify-center mb-3 overflow-hidden">
                                    {fav.productImageUrl ? (
                                        <img
                                            src={getImageUrl(fav.productImageUrl)}
                                            alt={fav.productName}
                                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-xs">{t('common.noImage')}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-black mb-1 truncate">
                                        {fav.productName}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <PriceDisplay
                                            price={fav.productPrice}
                                            discountPrice={fav.productDiscountPrice}
                                            discountPercentage={fav.productDiscountPercentage}
                                            size="md"
                                        />
                                        <span className={`text-xs ${
                                            fav.productInStock ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                            {fav.productInStock ? t('product.inStock') : t('product.soldOut')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;