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
        <div className="flex items-center justify-between mb-6 gap-4">
            {/* Active/Inactive filter — left 50% */}
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
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide border-t border-b border-r transition-colors ${
                        activeFilter === false
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-500 border-gray-300 hover:border-red-500 hover:text-red-500'
                    }`}
                >
                    Inactive
                </button>
            </div>

            {/* Search — right 50% */}
            <form
                onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(0); }}
                className="flex w-1/2"
            >
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={searchPlaceholder}
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
                        onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(0); }}
                        className="border border-gray-300 text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                        ×
                    </button>
                )}
            </form>
        </div>
    );
};

export default AdminSearchFilter;