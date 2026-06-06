const StarRating = ({ rating = 0, size = 'md', count = null, interactive = false, onRate = null }) => {
    const sizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onRate && onRate(star)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
                        disabled={!interactive}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className={sizes[size]}
                            fill={star <= rating ? '#000000' : 'none'}
                            stroke="#000000"
                            strokeWidth="1.5"
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </button>
                ))}
            </div>
            {count !== null && (
                <span className={`${textSizes[size]} text-gray-500 font-medium`}>
                    {rating > 0 ? rating.toFixed(1) : '0'} ({count})
                </span>
            )}
        </div>
    );
};

export default StarRating;