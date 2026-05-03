import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getActiveProducts, searchProducts, getProductsByCategory, getProductsByPriceRange } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import { useSearchParams } from 'react-router-dom';
import Skeleton from '../components/common/Skeleton';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(() => {
        const categoryFromUrl = searchParams.get('category');
        return categoryFromUrl ? parseInt(categoryFromUrl) : '';
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState('');
    const [appliedMaxPrice, setAppliedMaxPrice] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            const params = {
                page,
                size: 8,
                sort: `${sortBy},${sortDir}`
            };

            if (searchQuery) {
                response = await searchProducts(searchQuery, params);
            } else if (appliedMinPrice !== '' && appliedMaxPrice !== '') {
                response = await getProductsByPriceRange(appliedMinPrice, appliedMaxPrice, params);
            } else if (selectedCategory) {
                response = await getProductsByCategory(selectedCategory, params);
            } else {
                response = await getActiveProducts(params);
            }
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error('Failed to load products, error: ' + e);
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, selectedCategory, sortBy, sortDir, appliedMinPrice, appliedMaxPrice]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (e) {
            console.log('Failed to load categories: error: ' + e);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        setPage(0);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setPage(0);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tight text-black">All Products</h1>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button
                    type="submit"
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    Search
                </button>
                {searchQuery && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="border border-gray-300 text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </form>

            {searchQuery && (
                <p className="text-sm text-gray-500 mb-6">
                    Results for: <span className="font-semibold text-black">"{searchQuery}"</span>
                </p>
            )}
            <div className="flex items-center justify-between mb-8">
                {/* Price filter */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Price
                    </span>
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-24 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                    <span className="text-gray-400 text-sm">—</span>
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-24 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                    <button
                        onClick={() => {
                            setAppliedMinPrice(minPrice);
                            setAppliedMaxPrice(maxPrice);
                            setPage(0);
                            setSelectedCategory('');
                        }}
                        className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-800 transition-colors"
                    >
                        Apply
                    </button>
                    {(appliedMinPrice !== '' || appliedMaxPrice !== '') && (
                        <button
                            onClick={() => {
                                setMinPrice('');
                                setMaxPrice('');
                                setAppliedMinPrice('');
                                setAppliedMaxPrice('');
                                setPage(0);
                            }}
                            className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Sort */}
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

            {/* Category filter */}
            {!searchQuery && (
                <div className="flex gap-3 mb-8 flex-wrap border-b border-gray-200 pb-6">
                    <button
                        onClick={() => { setSelectedCategory(''); setPage(0); }}
                        className={`text-sm font-medium px-4 py-1.5 transition-colors ${
                            selectedCategory === ''
                                ? 'bg-black text-white'
                                : 'text-gray-500 hover:text-black border border-gray-300'
                        }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
                            className={`text-sm font-medium px-4 py-1.5 transition-colors ${
                                selectedCategory === cat.id
                                    ? 'bg-black text-white'
                                    : 'text-gray-500 hover:text-black border border-gray-300'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Products grid */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton className="aspect-square mb-3" />
                            <Skeleton className="h-3 w-16 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-24 mb-3" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {products.map(product => (
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
    );
};

export default ProductsPage;