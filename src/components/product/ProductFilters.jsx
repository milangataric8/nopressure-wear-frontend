import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LIGHT_COLORS = ['#FFFFFF', '#FFFF00', '#FFD700', '#FFC0CB', '#F5F5DC', '#C0C0C0'];

const ProductFilters = ({
                            isMobile,
                            isFilterVisible,
                            // categories
                            rootCategories,
                            getSubcategories,
                            expandedCategories,
                            toggleExpanded,
                            selectedCategory,
                            handleCategoryClick,
                            // color
                            availableColors,
                            selectedColor,
                            setSelectedColor,
                            // brand
                            availableBrands,
                            selectedBrand,
                            setSelectedBrand,
                            // material
                            availableMaterials,
                            selectedMaterial,
                            setSelectedMaterial,
                            // price
                            minPrice,
                            maxPrice,
                            setMinPrice,
                            setMaxPrice,
                            appliedMinPrice,
                            appliedMaxPrice,
                            setAppliedMinPrice,
                            setAppliedMaxPrice,
                            // gender
                            selectedGender,
                            setSelectedGender,
                            searchParams,
                            setSearchParams,
                            // shared
                            searchQuery,
                            setSearchQuery,
                            setSearchInput,
                            setPage,
                        }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const hasActiveFilters =
        selectedCategory !== '' ||
        appliedMinPrice !== '' ||
        searchQuery !== '' ||
        selectedBrand !== '' ||
        selectedColor !== '' ||
        selectedMaterial !== '' ||
        selectedGender !== '';

    const clearAll = () => {
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setAppliedMinPrice('');
        setAppliedMaxPrice('');
        setSearchQuery('');
        setSearchInput('');
        setSelectedBrand('');
        setSelectedColor('');
        setSelectedMaterial('');
        setSelectedGender('');
        setPage(0);
        navigate('/products');
    };

    const handleGenderToggle = (g) => {
        const next = selectedGender === g ? '' : g;
        setSelectedGender(next);
        setPage(0);
        const sp = new URLSearchParams(searchParams);
        if (next) sp.set('gender', next); else sp.delete('gender');
        setSearchParams(sp);
    };

    // setSelectedCategory comes through handleCategoryClick; expose a direct setter for clearAll
    function setSelectedCategory(val) {
        handleCategoryClick(val === '' ? '' : val, true);
    }

    return (
        <div className={isMobile ? 'w-full' : 'w-56 flex-shrink-0'}>
            {/* Gender filter */}
            <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                    {t('product.gender')}
                </h3>
                <div className="flex gap-2 flex-wrap">
                    {['MEN', 'WOMEN', 'UNISEX'].map(g => (
                        <button
                            key={g}
                            onClick={() => handleGenderToggle(g)}
                            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                                selectedGender === g
                                    ? 'bg-black text-white border-black'
                                    : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                            }`}
                        >
                            {t(`product.gender${g.charAt(0) + g.slice(1).toLowerCase()}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            {isFilterVisible('category') && (
                <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                        {t('product.categories')}
                    </h3>
                    <div className="space-y-1">
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
                                        {subcats.length > 0 && (
                                            <button
                                                onClick={() => toggleExpanded(cat.id)}
                                                className="text-gray-400 hover:text-black transition-colors px-1"
                                            >
                                                {expandedCategories.includes(cat.id) ? '−' : '+'}
                                            </button>
                                        )}
                                    </div>

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
            )}

            {/* Color filter */}
            {isFilterVisible('colorName') && availableColors.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                        {t('product.color')}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                        {availableColors.map(color => {
                            const isNoColor = color.colorName === 'No Color';
                            const isMultiColor = color.colorName === 'Multi-Color';
                            const isSelected = selectedColor === color.colorName;
                            const checkStroke = isNoColor || LIGHT_COLORS.includes(color.colorHex) ? 'black' : 'white';
                            const buttonStyle = isMultiColor
                                ? { background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }
                                : isNoColor
                                    ? { backgroundColor: 'white' }
                                    : { backgroundColor: color.colorHex };

                            return (
                                <button
                                    key={color.colorName}
                                    onClick={() => { setSelectedColor(prev => prev === color.colorName ? '' : color.colorName); setPage(0); }}
                                    className={`w-7 h-7 rounded-full transition-colors relative overflow-hidden border ${isSelected ? 'border-black border-2' : 'border-gray-300 hover:border-gray-500'}`}
                                    style={buttonStyle}
                                    title={color.colorName}
                                >
                                    {isNoColor && (
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                                            <line x1="5" y1="5" x2="19" y2="19" stroke="#ef4444" strokeWidth="2.5" />
                                        </svg>
                                    )}
                                    {isSelected && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={checkStroke} strokeWidth="4">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {selectedColor && (
                        <p className="text-xs text-gray-500 mt-2">
                            {t('product.selected')}: <span className="font-medium text-black">
                                {selectedColor === 'No Color' ? t('product.noColor')
                                    : selectedColor === 'Multi-Color' ? t('product.multiColor')
                                        : selectedColor}
                            </span>
                        </p>
                    )}
                </div>
            )}

            {/* Brand filter */}
            {isFilterVisible('brand') && availableBrands.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                        {t('product.brand')}
                    </h3>
                    <div className="space-y-1">
                        {availableBrands.map(brand => (
                            <button
                                key={brand}
                                onClick={() => { setSelectedBrand(prev => prev === brand ? '' : brand); setPage(0); }}
                                className={`block w-full text-left text-sm py-1 transition-colors ${
                                    selectedBrand === brand ? 'font-semibold text-black' : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Material filter */}
            {isFilterVisible('material') && availableMaterials.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                        {t('product.material')}
                    </h3>
                    <div className="space-y-1">
                        {availableMaterials.map(material => (
                            <button
                                key={material}
                                onClick={() => { setSelectedMaterial(prev => prev === material ? '' : material); setPage(0); }}
                                className={`block w-full text-left text-sm py-1 transition-colors ${
                                    selectedMaterial === material ? 'font-semibold text-black' : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                {material}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Price filter */}
            {isFilterVisible('price') && (
                <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                        {t('product.price')}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder={t('common.min')}
                            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                        <span className="text-gray-400 text-sm">—</span>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder={t('common.max')}
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
                        {t('common.apply')}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="w-full mt-2 border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                            {t('common.clearAll')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductFilters;