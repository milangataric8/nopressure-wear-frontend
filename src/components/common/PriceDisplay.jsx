import useFormatPrice from "../../hooks/useFormatPrice.js";

const PriceDisplay = ({ price, discountPrice, discountPercentage, size = 'md' }) => {
    const formatPrice = useFormatPrice();

    const sizes = {
        sm: { price: 'text-xs', original: 'text-xs', discount: 'text-xs' },
        md: { price: 'text-sm', original: 'text-xs', discount: 'text-xs' },
        lg: { price: 'text-2xl', original: 'text-lg', discount: 'text-sm' },
    };

    const s = sizes[size];

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {discountPrice ? (
                <>
                    <span className={`${s.price} font-bold text-red-600`}>
                        {formatPrice(discountPrice)}
                    </span>
                    <span className={`${s.original} text-gray-400 line-through`}>
                        {formatPrice(price)}
                    </span>
                    <span className={`${s.discount} font-semibold text-red-600`}>
                        -{discountPercentage}%
                    </span>
                </>
            ) : (
                <span className={`${s.price} font-bold text-black`}>
                    {formatPrice(price)}
                </span>
            )}
        </div>
    );
};

export default PriceDisplay;