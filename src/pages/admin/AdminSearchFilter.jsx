const AdminSearchFilter = ({
                               searchInput,
                               setSearchInput,
                               searchQuery,
                               setSearchQuery,
                               activeFilter,
                               setActiveFilter,
                               setPage,
                               searchPlaceholder = 'Search...'
                           }) => {
    return (
        <div className="flex items-center justify-between mb-6 gap-2 md:gap-4">
            {/* Active/Inactive filter */}
            <div className="flex w-1/2">
                <button
                    onClick={() => { setActiveFilter(prev => prev === true ? null : true); setPage(0); }}
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                        activeFilter === true
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-500 border-gray-300 hover:border-green-600 hover:text-green-600'
                    }`}
                >
                    Active
                </button>
                <button
                    onClick={() => { setActiveFilter(prev => prev === false ? null : false); setPage(0); }}
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                        activeFilter === false
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-gray-500 border-gray-300 hover:border-red-600 hover:text-red-600'
                    }`}
                >
                    Inactive
                </button>
            </div>

            {/* Search */}
            <form
                onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(0); }}
                className="flex w-1/2"
            >
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 min-w-0 border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button
                    type="submit"
                    className="bg-black text-white px-3 py-2.5 hover:bg-gray-800 transition-colors flex items-center justify-center flex-shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                </button>
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(0); }}
                        className="border border-gray-300 text-sm px-3 py-2.5 hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                        ×
                    </button>
                )}
            </form>
        </div>
    );
};

export default AdminSearchFilter;