import { useTranslation } from 'react-i18next';

const LIGHT_COLORS = ['#FFFFFF', '#FFFF00', '#FFD700', '#FFC0CB', '#F5F5DC', '#C0C0C0'];

const ProductFilterBar = ({
                              availableColors,
                              // availableBrands,
                              colorFilter,
                              setColorFilter,
                              // brandFilter,
                              // setBrandFilter,
                              genderFilter,
                              setGenderFilter,
                              setPage,
                              translateColorName,
                          }) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between mb-6 gap-2 md:gap-4">
            {/* Color filter */}
            <div className="flex w-1/2">
                {availableColors.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap items-center">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-2">
                            {t('product.color')}:
                        </span>
                        {availableColors.map(color => {
                            const isNoColor = color.colorName === 'No Color';
                            const isMultiColor = color.colorName === 'Multi-Color';
                            const isSelected = colorFilter === color.colorName;
                            const checkStroke = isNoColor || LIGHT_COLORS.includes(color.colorHex) ? 'black' : 'white';
                            const buttonStyle = isMultiColor
                                ? { background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }
                                : isNoColor
                                    ? { backgroundColor: 'white' }
                                    : { backgroundColor: color.colorHex };

                            return (
                                <button
                                    key={color.colorName}
                                    onClick={() => { setColorFilter(prev => prev === color.colorName ? '' : color.colorName); setPage(0); }}
                                    className={`w-6 h-6 rounded-full transition-colors relative overflow-hidden border ${
                                        isSelected ? 'border-black border-2' : 'border-gray-300 hover:border-gray-500'
                                    }`}
                                    style={buttonStyle}
                                    title={translateColorName(color.colorName)}
                                >
                                    {isNoColor && (
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                                            <line x1="5" y1="5" x2="19" y2="19" stroke="#ef4444" strokeWidth="2.5" />
                                        </svg>
                                    )}
                                    {isSelected && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={checkStroke} strokeWidth="4">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Brand filter */}
            {/*<div className="flex w-10/12">*/}
            {/*    {availableBrands.length > 0 && (*/}
            {/*        <div className="flex gap-2 mb-4 flex-wrap items-center">*/}
            {/*            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-2">*/}
            {/*                {t('product.brand')}:*/}
            {/*            </span>*/}
            {/*            {availableBrands.map(brand => (*/}
            {/*                <button*/}
            {/*                    key={brand}*/}
            {/*                    onClick={() => { setBrandFilter(prev => prev === brand ? '' : brand); setPage(0); }}*/}
            {/*                    className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${*/}
            {/*                        brandFilter === brand*/}
            {/*                            ? 'bg-black text-white border-black'*/}
            {/*                            : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'*/}
            {/*                    }`}*/}
            {/*                >*/}
            {/*                    {brand}*/}
            {/*                </button>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</div>*/}

            {/* Gender filter */}
            <div className="flex w-1/2">
                <div className="flex gap-2 mb-4 flex-wrap items-center">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-2">
                        {t('product.gender')}:
                    </span>
                    {['MEN', 'WOMEN', 'UNISEX'].map(g => (
                        <button
                            key={g}
                            onClick={() => { setGenderFilter(genderFilter === g ? '' : g); setPage(0); }}
                            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                                genderFilter === g
                                    ? 'bg-black text-white border-black'
                                    : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                            }`}
                        >
                            {t(`product.gender${g.charAt(0) + g.slice(1).toLowerCase()}`)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductFilterBar;