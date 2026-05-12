import { useState, useEffect, useCallback } from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getActiveProducts,
    searchProducts,
    getProductsByCategory,
    getProductsByCategories,
    getProductsByPriceRange
} from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import { getImageUrl } from '../utils/imageUtils';
import Skeleton from '../components/common/Skeleton';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(() => {
        const categoryFromUrl = new URLSearchParams(window.location.search).get('category');
        return categoryFromUrl ? parseInt(categoryFromUrl) : '';
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState('');
    const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const rootCategories = categories.filter(cat => !cat.parentId);

    const getSubcategories = (parentId) =>
        categories.filter(cat => cat.parentId === parentId);

    const isParentCategory = (categoryId) =>
        categories.some(cat => cat.parentId === categoryId);

    const getCategoryIds = (categoryId) => {
        const subcats = getSubcategories(categoryId);
        return [categoryId, ...subcats.map(s => s.id)];
    };

    const fetchProducts = useCallback(async () => {
        if (categories.length === 0) return;
        setLoading(true);
        try {
            let response;
            const params = {
                page,
                size: 12,
                sort: `${sortBy},${sortDir}`
            };

            if (searchQuery) {
                response = await searchProducts(searchQuery, params);
            } else if (appliedMinPrice !== '' && appliedMaxPrice !== '') {
                response = await getProductsByPriceRange(appliedMinPrice, appliedMaxPrice, params);
            } else if (selectedCategory) {
                if (isParentCategory(selectedCategory)) {
                    const categoryIds = getCategoryIds(selectedCategory);
                    response = await getProductsByCategories(categoryIds, params);
                } else {
                    response = await getProductsByCategory(selectedCategory, params);
                }
            } else {
                response = await getActiveProducts(params);
            }

            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (e) {
            toast.error('Failed to load products, error: ' + e.message, {});
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, selectedCategory, sortBy, sortDir, appliedMinPrice, appliedMaxPrice, categories]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (e) {
            console.log('Failed to load categories, error: ' + e.message + '');
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(parseInt(categoryFromUrl));
        }
    }, [searchParams]);

    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        const categoryFromUrl = searchParams.get('category');

        function resetFilters() {
            setShowFilters(false);
            setSelectedCategory('');
            setAppliedMinPrice('');
            setAppliedMaxPrice('');
            setMinPrice('');
            setMaxPrice('');
            setPage(0);
        }

        if (searchFromUrl) {
            setSearchInput(searchFromUrl);
            setSearchQuery(searchFromUrl);
            resetFilters();
        }
        if (categoryFromUrl) {
            setSelectedCategory(parseInt(categoryFromUrl));
        }
    }, [searchParams]);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        setSearchQuery('');
        setSearchInput('');
        setPage(0);
        setAppliedMinPrice('');
        setAppliedMaxPrice('');
        setMinPrice('');
        setMaxPrice('');
        navigate('/products');
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-black uppercase tracking-tight text-black">
                    {selectedCategory
                        ? categories.find(c => c.id === selectedCategory)?.name || 'Products'
                        : 'All Products'}
                </h1>
                <span className="text-sm text-gray-400">
                    {totalElements} {totalElements === 1 ? 'product' : 'products'}
                </span>
            </div>

            <div className="flex gap-8">
                {/* Filter panel — left side */}
                {showFilters && (
                    <div className="w-56 flex-shrink-0">
                        {/* Categories */}
                        <div className="mb-8">
                                <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                                    Categories
                                </h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleCategoryClick('')}
                                        className={`block w-full text-left text-sm py-1.5 transition-colors ${
                                            selectedCategory === ''
                                                ? 'font-semibold text-black'
                                                : 'text-gray-500 hover:text-black'
                                        }`}
                                    >
                                        All
                                    </button>

                                    {rootCategories.map(cat => (
                                        <div key={cat.id}>
                                            <button
                                                onClick={() => handleCategoryClick(cat.id)}
                                                className={`block w-full text-left text-sm py-1.5 transition-colors ${
                                                    selectedCategory === cat.id
                                                        ? 'font-semibold text-black'
                                                        : 'text-gray-500 hover:text-black'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>

                                            {/* Subcategories */}
                                            {getSubcategories(cat.id).map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => handleCategoryClick(sub.id)}
                                                    className={`block w-full text-left text-sm py-1.5 pl-4 transition-colors ${
                                                        selectedCategory === sub.id
                                                            ? 'font-semibold text-black'
                                                            : 'text-gray-400 hover:text-black'
                                                    }`}
                                                >
                                                    {sub.name}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        {/* Price filter */}
                        <div className="mb-8">
                            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                                Price
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="Min"
                                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                                />
                                <span className="text-gray-400 text-sm">—</span>
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="Max"
                                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setAppliedMinPrice(minPrice);
                                    setAppliedMaxPrice(maxPrice);
                                    setPage(0);
                                    setSelectedCategory('');
                                    setSearchQuery('');
                                    setSearchInput('');
                                    navigate('/products');
                                }}
                                className="w-full bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-800 transition-colors"
                            >
                                Apply
                            </button>
                            {(selectedCategory !== '' || appliedMinPrice !== '' || searchQuery !== '') && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setAppliedMinPrice('');
                                        setAppliedMaxPrice('');
                                        setSearchQuery('');
                                        setSearchInput('');
                                        setPage(0);
                                        navigate('/products');
                                    }}
                                    className="w-full mt-2 border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50 transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Products section — right side */}
                <div className="flex-1">
                    {/* Sort + Filter toggle */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
                        >
                            {showFilters ? '← Hide Filters' : '→ Show Filters'}
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Sort by
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                                className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                            >
                                <option value="name">Name</option>
                                <option value="price">Price</option>
                                <option value="createdAt">Newest</option>
                                <option value="stockQuantity">Stock</option>
                            </select>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => { setSortDir('asc'); setPage(0); }}
                                    className={`px-3 py-2 border text-sm transition-colors ${
                                        sortDir === 'asc'
                                            ? 'bg-black text-white border-black'
                                            : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                                    }`}
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => { setSortDir('desc'); setPage(0); }}
                                    className={`px-3 py-2 border text-sm transition-colors ${
                                        sortDir === 'desc'
                                            ? 'bg-black text-white border-black'
                                            : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                                    }`}
                                >
                                    ↓
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search result label */}
                    {searchQuery && (
                        <p className="text-sm text-gray-500 mb-6">
                            Results for: <span className="font-semibold text-black">"{searchQuery}"</span>
                        </p>
                    )}

                    {/* Products grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="aspect-square mb-3" />
                                    <Skeleton className="h-3 w-16 mb-2" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-24 mb-3" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-gray-400 h-64 flex items-center justify-center">
                            <p className="text-sm">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                            {products.map(product => (
                                <div key={product.id} className="group cursor-pointer">
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
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-12">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="text-sm font-medium px-6 py-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <span className="text-sm text-gray-500">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="text-sm font-medium px-6 py-2 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;