import { getApiErrorMessage } from '../utils/apiError.js';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { selectCollectionModels } from '../utils/selectCollectionModels';
import { Link } from 'react-router-dom';
import { getCatalogModels } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import {toast} from "react-toastify";
import HeroBanner from "../components/common/HeroBanner.jsx";
import HomePopup from "../components/common/HomePopup.jsx";
import CatalogModelCard from "../components/product/CatalogModelCard.jsx";
import Seo from '../components/seo/Seo';

const HomePage = () => {
    const { t } = useTranslation();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const fetchFeatured = useCallback(async () => {
        try {
            const response = await getCatalogModels({ page: 0, size: 100, sort: 'name,asc' });
            const models = selectCollectionModels(response.data.content);
            setFeaturedProducts(models);
        } catch (e) {
            toast.error(getApiErrorMessage(e, 'messages.failedToLoad'));
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (e) {
            toast.error(getApiErrorMessage(e, 'messages.failedToLoad'));
        }
    }, []);

    useEffect(() => {
        void fetchFeatured();
        void fetchCategories();
    }, [fetchFeatured, fetchCategories]);

    return (
        <div>
            <Seo url={`${window.location.origin}`} />
            <HomePopup />
            <HeroBanner />

            {/* Categories */}
            {categories.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="text-xl font-black uppercase tracking-tight text-black mb-8">
                        {t('product.shopByCategory')}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.slice(0, 4).map(cat => (
                            <Link
                                key={cat.id}
                                to={`/products?category=${cat.id}`}
                                className="bg-gray-100 p-8 text-center hover:bg-gray-200 transition-colors group"
                            >
                                <h3 className="text-sm font-black uppercase tracking-wide text-black group-hover:underline">
                                    {cat.name}
                                </h3>
                                {cat.description && (
                                    <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Featured products */}
            {featuredProducts.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black uppercase tracking-tight text-black">
                            {t('product.featuredModels')}
                        </h2>
                        <Link
                            to="/products"
                            className="text-xs font-semibold uppercase tracking-wide text-black hover:underline"
                        >
                            {t('product.viewAll')} →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                        {featuredProducts.map(model => (
                            <CatalogModelCard key={model.id} model={model} reviewsEnabled={false} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
