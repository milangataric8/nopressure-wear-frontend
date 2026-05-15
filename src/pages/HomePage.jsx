import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getActiveProducts } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import {getImageUrl} from "../utils/imageUtils.js";
import HeroBanner from "../components/common/HeroBanner.jsx";

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const fetchFeatured = useCallback(async () => {
        try {
            const response = await getActiveProducts({ page: 0, size: 4 });
            setFeaturedProducts(response.data.content);
        } catch (error) {
            console.log('Failed to load featured products: ' + error);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (error) {
            console.log('Failed to load categories, error: ' + error);
        }
    }, []);

    useEffect(() => {
        fetchFeatured();
        fetchCategories();
    }, [fetchFeatured, fetchCategories]);

    return (
        <div>
            <HeroBanner />

            {/* Categories */}
            {categories.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="text-xl font-black uppercase tracking-tight text-black mb-8">
                        Shop By Category
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
                            Featured Products
                        </h2>
                        <Link
                            to="/products"
                            className="text-xs font-semibold uppercase tracking-wide text-black hover:underline"
                        >
                            View All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                        {featuredProducts.map(product => (
                            <Link
                                key={product.id}
                                to={`/products/${product.id}`}
                                className="group cursor-pointer block"
                            >
                                <div className="bg-gray-100 aspect-square flex items-center justify-center mb-3 overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={getImageUrl(product.imageUrl)}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-xs">No image</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">
                                        {product.categoryName || 'Uncategorized'}
                                    </p>
                                    <h3 className="text-sm font-semibold text-black mb-1 truncate">
                                        {product.name}
                                    </h3>
                                    {/* Color variants */}
                                    {(product.colorVariants?.length > 0 || product.colorHex) && (
                                        <div className="flex gap-1 mt-2 flex-wrap">
                                            {/* Current product */}
                                            {product.colorHex && (
                                                <Link
                                                    to={`/products/${product.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-8 h-8 border-2 border-transparent hover:border-black overflow-hidden flex-shrink-0"
                                                    title={product.colorName}
                                                >
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={getImageUrl(product.imageUrl)}
                                                            alt={product.colorName || ''}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full" style={{ backgroundColor: product.colorHex }} />
                                                    )}
                                                </Link>
                                            )}

                                            {/* Variants */}
                                            {product.colorVariants?.map(variant => (
                                                <Link
                                                    key={variant.variantId}
                                                    to={`/products/${variant.variantId}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-8 h-8 border-2 border-transparent hover:border-black transition-colors overflow-hidden flex-shrink-0"
                                                    title={variant.colorName}
                                                >
                                                    {variant.imageUrl ? (
                                                        <img
                                                            src={getImageUrl(variant.imageUrl)}
                                                            alt={variant.colorName || ''}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full" style={{ backgroundColor: variant.colorHex || '#ccc' }} />
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-md font-bold text-black">
                                            ${product.price}
                                        </span>
                                        <span className={`text-xs ${
                                            product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                            {product.stockQuantity > 0 ? 'In Stock' : 'Sold Out'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;