const LIGHT_COLORS = ['#FFFFFF', '#FFFF00', '#FFD700', '#FFC0CB', '#F5F5DC', '#C0C0C0'];

const Checkmark = ({ stroke = 'white', width = 15 }) => (
    <svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="4">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ColorPicker = ({ palette, colorName, colorHex, onSelect, translateColorName, t }) => {
    const select = (name, hex) => onSelect(name, hex);

    return (
        <>
            {/* Label */}
            <div className="md:col-span-2 flex justify-center">
                <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                    {t('product.color')}
                </label>
            </div>

            {/* Swatches */}
            <div className="md:col-span-2 flex justify-center">
                <div className="flex flex-wrap gap-3 justify-center">
                    {palette.map(color => (
                        <button
                            key={color.name}
                            type="button"
                            onClick={() => select(color.name, color.hex)}
                            className={`w-10 h-10 rounded-full border-2 transition-colors ${
                                colorName === color.name ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={t(`product.colors.${color.key}`)}
                        >
                            {colorName === color.name && (
                                <span className="flex items-center justify-center h-full">
                                    <Checkmark stroke={LIGHT_COLORS.includes(color.hex) ? 'black' : 'white'} />
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Separator */}
                    <div className="w-px bg-gray-200 self-stretch mx-1" />

                    {/* No Color */}
                    <button
                        type="button"
                        onClick={() => select('No Color', '')}
                        className={`w-10 h-10 rounded-full border-2 transition-colors relative overflow-hidden bg-white ${
                            colorName === 'No Color' ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                        }`}
                        title={t('product.noColor')}
                    >
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                            <line x1="5" y1="5" x2="19" y2="19" stroke="#ef4444" strokeWidth="2.5" />
                        </svg>
                        {colorName === 'No Color' && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <Checkmark stroke="black" />
                            </span>
                        )}
                    </button>

                    {/* Multi-Color */}
                    <button
                        type="button"
                        onClick={() => select('Multi-Color', 'multicolor')}
                        className={`w-10 h-10 rounded-full border-2 transition-colors relative overflow-hidden ${
                            colorName === 'Multi-Color' ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
                        title={t('product.multiColor')}
                    >
                        {colorName === 'Multi-Color' && (
                            <span className="flex items-center justify-center h-full">
                                <Checkmark stroke="black" />
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Selected preview */}
            <div className="md:col-span-2 flex justify-center">
                {colorName && (
                    <div className="flex items-center gap-3">
                        {colorName === 'Multi-Color' ? (
                            <div className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                                 style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
                        ) : colorName === 'No Color' ? (
                            <div className="w-8 h-8 rounded-full border border-gray-300 bg-white relative overflow-hidden flex-shrink-0">
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                                    <line x1="5" y1="5" x2="19" y2="19" stroke="#ef4444" strokeWidth="2.5" />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                                 style={{ backgroundColor: colorHex }} />
                        )}
                        <span className="text-sm text-black font-medium">{translateColorName(colorName)}</span>
                        {colorHex && colorName !== 'Multi-Color' && (
                            <span className="text-xs text-gray-400">{colorHex}</span>
                        )}
                        <button
                            type="button"
                            onClick={() => select('', '')}
                            className="text-xs text-red-400 hover:text-red-600 underline ml-2"
                        >
                            {t('common.clear')}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default ColorPicker;