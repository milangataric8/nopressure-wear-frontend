import {t} from "i18next";

const ActiveFilters = ({
                           selectedCategory, categories, selectedColor, availableColors,
                           selectedBrand, selectedMaterial, appliedMinPrice, appliedMaxPrice,
                           searchQuery, selectedGender,
                           onRemoveCategory, onRemoveColor, onRemoveBrand,
                           onRemoveMaterial, onRemovePrice, onRemoveSearch, onRemoveGender, onClearAll
                       }) => {
    const activeFilters = [];

    if (selectedCategory) {
        const cat = categories.find(c => c.id === selectedCategory);
        if (cat) activeFilters.push({ label: cat.name, onRemove: onRemoveCategory });
    }
    if (selectedColor) {
        const color = availableColors.find(c => c.colorName === selectedColor);
        activeFilters.push({ label: selectedColor, color: color?.colorHex, onRemove: onRemoveColor });
    }
    if (selectedBrand) {
        activeFilters.push({ label: selectedBrand, onRemove: onRemoveBrand });
    }
    if (selectedMaterial) {
        activeFilters.push({ label: selectedMaterial, onRemove: onRemoveMaterial });
    }
    if (appliedMinPrice !== '' || appliedMaxPrice !== '') {
        activeFilters.push({
            label: `${appliedMinPrice || '0'} - ${appliedMaxPrice || '∞'} RSD`,
            onRemove: onRemovePrice
        });
    }
    if (selectedGender) {
        const label = selectedGender === 'MEN' ? t('product.genderMen')
            : selectedGender === 'WOMEN' ? t('product.genderWomen')
            : t('product.genderUnisex');
        activeFilters.push({ label, onRemove: onRemoveGender });
    }
    if (searchQuery) {
        activeFilters.push({ label: `"${searchQuery}"`, onRemove: onRemoveSearch });
    }

    if (activeFilters.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((filter, index) => (
                <button
                    key={index}
                    onClick={filter.onRemove}
                    className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:border-black hover:text-black transition-colors group"
                >
                    {filter.color && (
                        <span
                            className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                            style={{ backgroundColor: filter.color }}
                        />
                    )}
                    <span>{filter.label}</span>
                    <span className="text-gray-400 group-hover:text-black">×</span>
                </button>
            ))}
            {activeFilters.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="text-xs text-gray-400 hover:text-black transition-colors underline px-1"
                >
                    {t('common.clearAll')}
                </button>
            )}
        </div>
    );
};

export default ActiveFilters;