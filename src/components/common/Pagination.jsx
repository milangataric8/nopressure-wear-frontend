const Pagination = ({ page, totalPages, setPage }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-200">
            <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-sm font-medium px-4 py-1.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
            >
                Prev
            </button>
            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
            <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="text-sm font-medium px-4 py-1.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;