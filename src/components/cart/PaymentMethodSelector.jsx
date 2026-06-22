import { useTranslation } from 'react-i18next';

const PaymentMethodSelector = ({
                                   cardEnabled,
                                   codEnabled,
                                   paymentMethod,
                                   setPaymentMethod,
                                   isAuthenticated,
                                   displayItems,
                                   checkingOut,
                                   onProceedToPayment,
                                   onCashOnDelivery,
                                   onGuestCheckout,
                               }) => {
    const { t } = useTranslation();

    const buttonClass = (active) =>
        `w-full flex items-center gap-3 p-4 border transition-colors text-left ${
            active ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
        }`;

    return (
        <div>
            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                {t('cart.paymentMethod')}
            </h3>
            <div className="space-y-3 mb-6">
                {cardEnabled && (
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={buttonClass(paymentMethod === 'card')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-black">{t('cart.payWithCard')}</p>
                            <p className="text-xs text-gray-400">{t('cart.cardDescription')}</p>
                        </div>
                    </button>
                )}

                {codEnabled && (
                    <button
                        onClick={() => setPaymentMethod('cod')}
                        className={buttonClass(paymentMethod === 'cod')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-black">{t('cart.cashOnDelivery')}</p>
                            <p className="text-xs text-gray-400">{t('cart.codDescription')}</p>
                        </div>
                    </button>
                )}

                {!cardEnabled && !codEnabled && (
                    <p className="text-sm text-red-500">{t('cart.noPaymentMethods')}</p>
                )}
            </div>

            {paymentMethod === 'card' && (
                <button
                    onClick={isAuthenticated() ? onProceedToPayment : onGuestCheckout}
                    disabled={!displayItems.length}
                    className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-4 hover:bg-gray-800 transition-colors disabled:opacity-30"
                >
                    {t('cart.proceedToPayment')}
                </button>
            )}

            {paymentMethod === 'cod' && (
                <button
                    onClick={isAuthenticated() ? onCashOnDelivery : onGuestCheckout}
                    disabled={!displayItems.length || checkingOut}
                    className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-4 hover:bg-gray-800 transition-colors disabled:opacity-30"
                >
                    {checkingOut ? t('cart.placingOrder') : t('cart.placeOrder')}
                </button>
            )}
        </div>
    );
};

export default PaymentMethodSelector;