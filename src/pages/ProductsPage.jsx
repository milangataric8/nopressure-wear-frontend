import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductFilters, searchActiveProducts } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import { getImageUrl } from '../utils/imageUtils';
import { getVisibleFilters } from '../api/filterApi';
import { useTranslation } from 'react-i18next';
import Skeleton from '../components/common/Skeleton';
import Pagination from "../components/common/Pagination.jsx";
import useFormatPrice from '../hooks/useFormatPrice';
import StarRating from '../components/common/StarRating';
import PriceDisplay from "../components/common/PriceDisplay.jsx";
import ActiveFilters from "../components/common/ActiveFilters.jsx";
import {getSettingsMap} from "../api/settingsApi.js";
import ProductFilters from "../components/product/ProductFilters.jsx";

const ProductsPage = () => {
    const { t } = useTranslation();
    useFormatPrice();
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
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [filterConfig, setFilterConfig] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [reviewsEnabled, setReviewsEnabled] = useState(true);
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
            if (selectedMaterial) params.material = selectedMaterial;
            if (selectedGender) params.gender = selectedGender;

            const response = await searchActiveProducts(params);

            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoadProducts'));
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, selectedCategory, sortBy, sortDir, appliedMinPrice, appliedMaxPrice, selectedBrand, selectedColor, selectedMaterial, selectedGender, categories]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories();
            setCategories(response.data.content || response.data);
        } catch (e) {
            console.log(e.response?.data?.message || t('messages.failedToLoadCategories'));
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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

    // Single consolidated URL sync — gender + category + search all handled here
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        const categoryFromUrl = searchParams.get('category');
        const genderFromUrl = searchParams.get('gender');

        if (searchFromUrl !== null) {
            setSearchInput(searchFromUrl);
            setSearchQuery(searchFromUrl);
            setSelectedCategory('');
            setSelectedGender('');
            setAppliedMinPrice('');
            setAppliedMaxPrice('');
            setMinPrice('');
            setMaxPrice('');
            setPage(0);
            return;
        }

        setSelectedCategory(categoryFromUrl ? parseInt(categoryFromUrl) : '');
        setSelectedGender(genderFromUrl || '');
        setPage(0);
    }, [searchParams]);

    useEffect(() => {
        getVisibleFilters().then(r => {
            setFilterConfig(r.data);
        }).catch((e) => console.log('Filter error:', e));

        const handler = () => {
            getVisibleFilters().then(r => setFilterConfig(r.data)).catch(() => {});
        };
        window.addEventListener('settings-updated', handler);
        return () => window.removeEventListener('settings-updated', handler);
    }, []);

    const isFilterVisible = (fieldName) => {
        if (filterConfig.length === 0) return false;
        return filterConfig.some(f => f.fieldName.toLowerCase() === fieldName.toLowerCase());
    };

    useEffect(() => {
        getProductFilters().then(r => {
            setAvailableBrands(r.data.brands || []);
            setAvailableColors(r.data.colors || []);
            setAvailableMaterials(r.data.materials || []);
        }).catch(() => {});
    }, []);


    useEffect(() => {
        getSettingsMap().then(r => {
            setReviewsEnabled(r.data.reviews_enabled !== 'false');
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
                    {(() => {
                        const genderLabel = selectedGender
                            ? t(`product.gender${selectedGender.charAt(0) + selectedGender.slice(1).toLowerCase()}`)
                            : null;
                        const categoryName = categories.find(c => c.id === selectedCategory)?.name;
                        if (genderLabel && categoryName) return `${genderLabel} · ${categoryName}`;
                        return genderLabel || categoryName || t('nav.products');
                    })()}
                </h1>
                <span className="text-sm text-gray-400">
                    {totalElements} {totalElements === 1 ? t('product.product') : t('product.products')}
                </span>
            </div>

            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-8`}>
                {showFilters && (
                    <ProductFilters
                        isMobile={isMobile}
                        isFilterVisible={isFilterVisible}
                        rootCategories={rootCategories}
                        getSubcategories={getSubcategories}
                        expandedCategories={expandedCategories}
                        toggleExpanded={toggleExpanded}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        handleCategoryClick={handleCategoryClick}
                        availableColors={availableColors}
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                        availableBrands={availableBrands}
                        selectedBrand={selectedBrand}
                        setSelectedBrand={setSelectedBrand}
                        availableMaterials={availableMaterials}
                        selectedMaterial={selectedMaterial}
                        setSelectedMaterial={setSelectedMaterial}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        setMinPrice={setMinPrice}
                        setMaxPrice={setMaxPrice}
                        appliedMinPrice={appliedMinPrice}
                        appliedMaxPrice={appliedMaxPrice}
                        setAppliedMinPrice={setAppliedMinPrice}
                        setAppliedMaxPrice={setAppliedMaxPrice}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        setSearchInput={setSearchInput}
                        setPage={setPage}
                        selectedGender={selectedGender}
                        setSelectedGender={setSelectedGender}
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                    />
                )}

                {/* Products section — right side */}
                <div className="flex-1">
                    {/* Sort + Filter toggle */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
                        >
                            {showFilters ? t('product.hideFilters') : t('product.showFilters')}
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {t('product.sortBy')}
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                                className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                            >
                                <option value="name">{t('product.name')}</option>
                                <option value="price">{t('product.price')}</option>
                                <option value="createdAt">{t('product.newest')}</option>
                                <option value="stockQuantity">{t('product.stock')}</option>
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
                            {t('product.resultsFor', { query: searchQuery })}
                        </p>
                    )}

                    <ActiveFilters
                        selectedCategory={selectedCategory}
                        categories={categories}
                        selectedColor={selectedColor}
                        availableColors={availableColors}
                        selectedBrand={selectedBrand}
                        selectedMaterial={selectedMaterial}
                        appliedMinPrice={appliedMinPrice}
                        appliedMaxPrice={appliedMaxPrice}
                        searchQuery={searchQuery}
                        onRemoveCategory={() => { setSelectedCategory(''); setPage(0); }}
                        onRemoveColor={() => { setSelectedColor(''); setPage(0); }}
                        onRemoveBrand={() => { setSelectedBrand(''); setPage(0); }}
                        onRemoveMaterial={() => { setSelectedMaterial(''); setPage(0); }}
                        onRemovePrice={() => { setMinPrice(''); setMaxPrice(''); setAppliedMinPrice(''); setAppliedMaxPrice(''); setPage(0); }}
                        onRemoveSearch={() => { setSearchQuery(''); setSearchInput(''); setPage(0); navigate('/products'); }}
                        onRemoveGender={() => { setSelectedGender(''); setPage(0); setSearchParams(prev => { const sp = new URLSearchParams(prev); sp.delete('gender'); return sp; }); }}
                        selectedGender={selectedGender}
                        onClearAll={() => {
                            setSelectedCategory(''); setSelectedColor(''); setSelectedBrand('');
                            setSelectedMaterial(''); setAppliedMinPrice(''); setAppliedMaxPrice('');
                            setMinPrice(''); setMaxPrice(''); setSearchQuery(''); setSearchInput('');
                            setSelectedGender(''); setSearchParams({});
                        }}
                    />

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
                            <p className="text-sm">{t('product.noProducts')}</p>
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
                                            <span className="text-gray-400 text-xs">{t('common.noImage')}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">
                                            {product.categoryName || t('product.uncategorized')}
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
                                            <PriceDisplay
                                                price={product.price}
                                                discountPrice={product.discountPrice}
                                                discountPercentage={product.discountPercentage}
                                                size="md"
                                            />
                                            <span className={`text-xs ${
                                                product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'
                                            }`}>
                                                {product.stockQuantity > 0 ? t('product.inStock') : t('product.soldOut')}
                                            </span>
                                        </div>

                                        {reviewsEnabled &&
                                            <StarRating rating={product.averageRating || 0} count={product.ratingCount || 0} size="sm" />
                                        }
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