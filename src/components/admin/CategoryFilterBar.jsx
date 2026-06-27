const CategoryFilterBar = ({ categories, categoryFilter, setCategoryFilter, setPage }) => {
    return (
        <div className="mb-6 border border-gray-200">
            {/* Root categories */}
            <div className="flex border-b border-gray-200">
                {categories.filter(cat => !cat.parentId).map(cat => {
                    const subcats = categories.filter(c => c.parentId === cat.id);
                    const isSelected = categoryFilter === cat.id || subcats.some(s => s.id === categoryFilter);

                    return (
                        <div key={cat.id} className="flex-1 relative border-r border-gray-200 last:border-r-0">
                            <button
                                onClick={() => {
                                    setCategoryFilter(isSelected ? null : cat.id);
                                    setPage(0);
                                }}
                                className={`w-full py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                    isSelected
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black'
                                }`}
                            >
                                {cat.name}
                                {subcats.length > 0 && (
                                    <span className="ml-1 text-xs opacity-60">▾</span>
                                )}
                            </button>

                            {/* Dropdown subcategories */}
                            {isSelected && subcats.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-200 z-10 shadow-sm">
                                    {subcats.map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => {
                                                setCategoryFilter(prev => prev === sub.id ? cat.id : sub.id);
                                                setPage(0);
                                            }}
                                            className={`w-full py-2 text-xs uppercase tracking-wide transition-colors border-b border-gray-100 last:border-b-0 ${
                                                categoryFilter === sub.id
                                                    ? 'bg-gray-100 text-black font-semibold'
                                                    : 'text-gray-400 hover:bg-gray-50 hover:text-black'
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
    );
};

export default CategoryFilterBar;