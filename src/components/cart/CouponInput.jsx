import { useTranslation } from 'react-i18next';

const CouponInput = ({
                         couponCode,
                         setCouponCode,
                         couponData,
                         setCouponData,
                         applyingCoupon,
                         onApplyCoupon,
                     }) => {
    const { t } = useTranslation();

    return (
        <div className="mb-4">
            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-3">
                {t('cart.promoCode')}
            </h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={t('cart.enterCode')}
                    className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button
                    onClick={onApplyCoupon}
                    disabled={applyingCoupon}
                    className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {t('common.apply')}
                </button>
            </div>
            {couponData && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200">
                    <p className="text-xs text-green-700 font-medium">{couponData.message}</p>
                    <button
                        onClick={() => { setCouponData(null); setCouponCode(''); }}
                        className="text-xs text-gray-400 hover:text-black underline mt-1"
                    >
                        {t('common.remove')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CouponInput;