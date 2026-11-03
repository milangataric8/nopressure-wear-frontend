import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductFilters, getCatalogModels } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import { getVisibleFilters } from '../api/filterApi';
import { useTranslation } from 'react-i18next';
import Skeleton from '../components/common/Skeleton';
import Pagination from "../components/common/Pagination.jsx";
import useFormatPrice from '../hooks/useFormatPrice';
import CatalogModelCard from "../components/product/CatalogModelCard.jsx";
import ActiveFilters from "../components/common/ActiveFilters.jsx";
import {getSettingsMap} from "../api/settingsApi.js";
import ProductFilters from "../components/product/ProductFilters.jsx";
import Seo from '../components/seo/Seo';

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
    const [selectedSizes, setSelectedSizes] = useState(() => searchParams.getAll('sizes'));
    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableGenders, setAvailableGenders] = useState([]);
    const [priceRangeAvailable, setPriceRangeAvailable] = useState(false);
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

    const [activeCategoryIds, setActiveCategoryIds] = useState(null);
    const catalogCategories = activeCategoryIds === null ? [] : categories.filter(cat =>
        activeCategoryIds.includes(cat.id) || categories.some(child => child.parentId === cat.id && activeCategoryIds.includes(child.id)));
    const rootCategories = catalogCategories.filter(cat => !cat.parentId);

    const getSubcategories = (parentId) =>
        catalogCategories.filter(cat => cat.parentId === parentId);

    const fetchProducts = useCallback(async () => {
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
            if (selectedSizes.length > 0) params.sizes = selectedSizes;

            const response = await getCatalogModels(params);

            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoadProducts'));
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, selectedCategory, sortBy, sortDir, appliedMinPrice, appliedMaxPrice, selectedBrand, selectedColor, selectedMaterial, selectedGender, selectedSizes, categories]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories();
            setCategories(response.data.content || response.data);
        } catch (e) {
            console.log(e.response?.data?.message || t('messages.failedToLoadCategories'));
        }
    }, []);

    useEffect(() => {
        void fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        void fetchProducts();
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
            setSelectedSizes([]);
            setAppliedMinPrice('');
            setAppliedMaxPrice('');
            setMinPrice('');
            setMaxPrice('');
            setPage(0);
            return;
        }

        setSelectedCategory(categoryFromUrl ? parseInt(categoryFromUrl) : '');
        setSelectedGender(genderFromUrl || '');
        setSelectedSizes(searchParams.getAll('sizes'));
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
        if (fieldName === 'price' && !priceRangeAvailable) return false;
        return filterConfig.some(f => f.fieldName.toLowerCase() === fieldName.toLowerCase());
    };

    useEffect(() => {
        getProductFilters().then(r => {
            setAvailableBrands((r.data.brands || []).filter(v => v?.trim()));
            setActiveCategoryIds(r.data.categoryIds || []);
            setAvailableColors(r.data.colors || []);
            setAvailableMaterials((r.data.materials || []).filter(v => v?.trim()));
            setAvailableSizes(r.data.sizes || []);
            setAvailableGenders(r.data.genders || []);
            setPriceRangeAvailable(r.data.priceRangeAvailable === true);
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
            <Seo title={t('nav.products')} url={`${window.location.origin}/products`} />
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
                    {t('product.modelCount', { count: totalElements })}
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
                        availableGenders={availableGenders}
                        availableSizes={availableSizes}
                        selectedSizes={selectedSizes}
                        setSelectedSizes={setSelectedSizes}
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
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
                                aria-label={t('product.sortBy')}
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
                        selectedSizes={selectedSizes}
                        appliedMinPrice={appliedMinPrice}
                        appliedMaxPrice={appliedMaxPrice}
                        searchQuery={searchQuery}
                        onRemoveCategory={() => { setSelectedCategory(''); setPage(0); }}
                        onRemoveColor={() => { setSelectedColor(''); setPage(0); }}
                        onRemoveBrand={() => { setSelectedBrand(''); setPage(0); }}
                        onRemoveMaterial={() => { setSelectedMaterial(''); setPage(0); }}
                        onRemoveSize={(size) => {
                            setSelectedSizes(prev => prev.filter(s => s !== size));
                            setPage(0);
                            setSearchParams(prev => {
                                const sp = new URLSearchParams(prev);
                                const remaining = sp.getAll('sizes').filter(s => s !== size);
                                sp.delete('sizes');
                                remaining.forEach(s => sp.append('sizes', s));
                                return sp;
                            });
                        }}
                        onRemovePrice={() => { setMinPrice(''); setMaxPrice(''); setAppliedMinPrice(''); setAppliedMaxPrice(''); setPage(0); }}
                        onRemoveSearch={() => { setSearchQuery(''); setSearchInput(''); setPage(0); navigate('/products'); }}
                        onRemoveGender={() => { setSelectedGender(''); setPage(0); setSearchParams(prev => { const sp = new URLSearchParams(prev); sp.delete('gender'); return sp; }); }}
                        selectedGender={selectedGender}
                        onClearAll={() => {
                            setSelectedCategory(''); setSelectedColor(''); setSelectedBrand('');
                            setSelectedMaterial(''); setAppliedMinPrice(''); setAppliedMaxPrice('');
                            setMinPrice(''); setMaxPrice(''); setSearchQuery(''); setSearchInput('');
                            setSelectedGender(''); setSelectedSizes([]); setSearchParams({});
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
                            {products.map(model => (
                                <CatalogModelCard key={model.id + ':' + model.options.map(option => option.id).join(',')}
                                    model={model} reviewsEnabled={reviewsEnabled} />
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