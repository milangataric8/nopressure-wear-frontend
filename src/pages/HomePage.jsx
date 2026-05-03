import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getActiveProducts, getProductsByCategory } from '../api/productApi';
import { getCategories } from '../api/categoryApi';

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
            {/* Hero */}
            <div className="bg-gray-100 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                        New Collection
                    </p>
                    <h1 className="text-6xl font-black uppercase tracking-tight text-black mb-6 leading-none">
                        webshop
                    </h1>
                    <p className="text-gray-500 text-lg mb-10 max-w-md">
                        Discover the latest products and find your perfect match.
                    </p>
                    <Link
                        to="/products"
                        className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-4 hover:bg-gray-800 transition-colors inline-block"
                    >
                        Shop Now
                    </Link>
                </div>
            </div>

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
                            <div key={product.id} className="group cursor-pointer">
                                <div className="bg-gray-100 aspect-square flex items-center justify-center mb-3 overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-black">
                                            ${product.price}
                                        </span>
                                        <span className={`text-xs ${
                                            product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                            {product.stockQuantity > 0 ? 'In Stock' : 'Sold Out'}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/products/${product.id}`}
                                        className="mt-2 block text-center text-xs font-semibold uppercase tracking-wide bg-black text-white py-2 hover:bg-gray-800 transition-colors"
                                    >
                                        View Product
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;