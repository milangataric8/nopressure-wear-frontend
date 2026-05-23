import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {getProductFilters, searchActiveProducts} from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import { getImageUrl } from '../utils/imageUtils';
import Skeleton from '../components/common/Skeleton';
import Pagination from "../components/common/Pagination.jsx";

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
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const navigate = useNavigate();

    const rootCategories = categories.filter(cat => !cat.parentId);

    const getSubcategories = (parentId) =>
        categories.filter(cat => cat.parentId === parentId);

    const fetchProducts = useCallback(async () => {
        if (categories.length === 0) return;
        setLoading(true);
        try {
            const params = {
                page,
                size: 12,
                sort: `${sortBy},${sortDir}`
            };

            if (searchQuery) params.search = searchQuery;
            if (selectedCategory) params.categoryId = selectedCategory;
            if (appliedMinPrice !== '') params.minPrice = appliedMinPrice;
            if (appliedMaxPrice !== '') params.maxPrice = appliedMaxPrice;
            if (selectedBrand) params.brand = selectedBrand;
            if (selectedColor) params.colorName = selectedColor;

            const response = await searchActiveProducts(params);

            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, selectedCategory, sortBy, sortDir, appliedMinPrice, appliedMaxPrice, selectedBrand, selectedColor, categories]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories();
            setCategories(response.data.content || response.data);
        } catch (e) {
            console.log('Failed to load categories: ' + e.message, {});
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
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) setShowFilters(false);
    }, [isMobile]);

    const toggleExpanded = (categoryId) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

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

        if (searchFromUrl !== null) {
            setSearchInput(searchFromUrl);
            setSearchQuery(searchFromUrl);
            resetFilters();
            return;
        }
        if (categoryFromUrl !== null) {
            setSelectedCategory(parseInt(categoryFromUrl));
        }
    }, [searchParams]);

    useEffect(() => {
        getProductFilters().then(r => {
            setAvailableBrands(r.data.brands || []);
            setAvailableColors(r.data.colors || []);
        }).catch(() => {});
    }, []);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        setSearchQuery('');
        setSearchInput('');
        setPage(0);
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

            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-8`}>
                {showFilters && (
                    <div className={isMobile ? 'w-full' : 'w-56 flex-shrink-0'}>
                        {/* Categories */}
                        <div className="mb-8">
                            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                                Categories
                            </h3>
                            <div className="space-y-1">
                                {/* Root categories */}
                                {rootCategories.map(cat => {
                                    const subcats = getSubcategories(cat.id);
                                    return (
                                        <div key={cat.id}>
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => handleCategoryClick(selectedCategory === cat.id ? '' : cat.id)}
                                                    className={`text-sm py-1.5 transition-colors flex-1 text-left ${
                                                        selectedCategory === cat.id
                                                            ? 'font-semibold text-black'
                                                            : 'text-gray-500 hover:text-black'
                                                    }`}
                                                >
                                                    {cat.name}
                                                </button>

                                                {/* Expand toggle — only if has subcategories */}
                                                {subcats.length > 0 && (
                                                    <button
                                                        onClick={() => toggleExpanded(cat.id)}
                                                        className="text-gray-400 hover:text-black transition-colors px-1"
                                                    >
                                                        {expandedCategories.includes(cat.id) ? '−' : '+'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Subcategories */}
                                            {expandedCategories.includes(cat.id) && (
                                                <div className="ml-3 border-l border-gray-200 pl-3 space-y-1 mt-1 mb-1">
                                                    {subcats.map(sub => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => handleCategoryClick(selectedCategory === sub.id ? '' : sub.id)}
                                                            className={`block w-full text-left text-sm py-1 transition-colors ${
                                                                selectedCategory === sub.id
                                                                    ? 'font-semibold text-black'
                                                                    : 'text-gray-400 hover:text-black'
                                                            }`}
                                                        >
                                                            {sub.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color filter */}
                        {availableColors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                                    Color
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {availableColors.map(color => (
                                        <button
                                            key={color.colorName}
                                            onClick={() => {
                                                setSelectedColor(prev => prev === color.colorName ? '' : color.colorName);
                                                setPage(0);
                                            }}
                                            className={`w-7 h-7 rounded-full border-1 border-gray-300 hover:border-gray-500 transition-colors tooltip-container`}
                                            style={{ backgroundColor: color.colorHex }}
                                            title={color.colorName}
                                        >
                                            {selectedColor === color.colorName && (
                                                <span className="flex items-center justify-center h-full">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                                        <polyline points="20 6 9 17 4 12"/>
                                                    </svg>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {selectedColor && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Selected: <span className="font-medium text-black">{selectedColor}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Brand filter */}
                        {availableBrands.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                                    Brand
                                </h3>
                                <div className="space-y-1">
                                    {availableBrands.map(brand => (
                                        <button
                                            key={brand}
                                            onClick={() => {
                                                setSelectedBrand(prev => prev === brand ? '' : brand);
                                                setPage(0);
                                            }}
                                            className={`block w-full text-left text-sm py-1 transition-colors ${
                                                selectedBrand === brand
                                                    ? 'font-semibold text-black'
                                                    : 'text-gray-500 hover:text-black'
                                            }`}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                    if (appliedMinPrice !== '' || appliedMaxPrice !== '') {
                                        setAppliedMinPrice('');
                                        setAppliedMaxPrice('');
                                    } else {
                                        setAppliedMinPrice(minPrice);
                                        setAppliedMaxPrice(maxPrice);
                                    }
                                    setPage(0);
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
                                                    <div
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
                                                    </div>
                                                )}

                                                {/* Variants */}
                                                {product.colorVariants?.map(variant => (
                                                    <button
                                                        key={variant.variantId}
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/products/${variant.variantId}`); }}
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
                                                    </button>
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
                    )}

                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;