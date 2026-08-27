import { useTranslation } from 'react-i18next';
import { inputClass, inputNormal, inputError } from '../../utils/validationUtils';

const ShippingAddressSelector = ({
                                     isAuthenticated,
                                     addresses,
                                     selectedAddress,
                                     setSelectedAddress,
                                     showNewAddress,
                                     setShowNewAddress,
                                     newAddress,
                                     setNewAddress,
                                     saveAddress,
                                     setSaveAddress,
                                     isMainAddress,
                                     setIsMainAddress,
                                     errors = {},
                                     setErrors,
                                     validateCheckout,
                                 }) => {
    const { t } = useTranslation();

    const handleUseAddress = () => {
        if (!validateCheckout()) {
            return;
        }

        setSelectedAddress(newAddress);
        setShowNewAddress(false);
    };

    const handleChange = (field) => (e) => {
        const { value } = e.target;
        setNewAddress(prev => ({ ...prev, [field]: value }));
        if (errors[field] && setErrors) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="border border-gray-200 p-6 mb-6">
            <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                {t('cart.shippingAddress')}
            </h3>

            {/* Existing addresses (authenticated only) */}
            {isAuthenticated() && addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                    {addresses.map(address => (
                        <button
                            key={address.id}
                            onClick={() => {
                                setSelectedAddress(address);
                                setShowNewAddress(false);
                                if (errors.address && setErrors) setErrors(prev => ({ ...prev, address: undefined }));
                            }}
                            className={`w-full text-left p-3 border transition-colors ${
                                selectedAddress?.id === address.id
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <p className="text-sm font-medium text-black">{address.street}</p>
                            <p className="text-xs text-gray-500">{address.city}, {address.postalCode}</p>
                            <p className="text-xs text-gray-500">{address.country}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Add new address */}
            {!showNewAddress ? (
                <>
                    <button
                        onClick={() => { setShowNewAddress(true); setSelectedAddress(null); }}
                        aria-invalid={!!errors.address}
                        className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
                    >
                        {t('cart.addNewAddress')}
                    </button>
                    {errors.address && <p className="text-xs text-red-500 mt-2">{errors.address}</p>}
                </>
            ) : (
                <div className="space-y-3">
                    <div>
                        <input
                            type="text"
                            value={newAddress.street}
                            onChange={handleChange('street')}
                            placeholder={t('cart.street')}
                            aria-invalid={!!errors.street}
                            className={`${inputClass} ${errors.street ? inputError : inputNormal}`}
                        />
                        {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <input
                                type="text"
                                value={newAddress.city}
                                onChange={handleChange('city')}
                                placeholder={t('cart.city')}
                                aria-invalid={!!errors.city}
                                className={`${inputClass} ${errors.city ? inputError : inputNormal}`}
                            />
                            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                        </div>
                        <div>
                            <input
                                type="text"
                                value={newAddress.postalCode}
                                onChange={handleChange('postalCode')}
                                placeholder={t('cart.postalCode')}
                                aria-invalid={!!errors.postalCode}
                                className={`${inputClass} ${errors.postalCode ? inputError : inputNormal}`}
                            />
                            {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                        </div>
                    </div>
                    <div>
                        <input
                            type="text"
                            value={newAddress.country}
                            onChange={handleChange('country')}
                            placeholder={t('cart.country')}
                            aria-invalid={!!errors.country}
                            className={`${inputClass} ${errors.country ? inputError : inputNormal}`}
                        />
                        {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                    </div>

                    {/* Save options (authenticated only) */}
                    {isAuthenticated() && (
                        <div className="space-y-2 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={saveAddress}
                                    onChange={(e) => setSaveAddress(e.target.checked)}
                                    className="w-3.5 h-3.5"
                                />
                                <span className="text-xs text-gray-500">{t('cart.saveAddress')}</span>
                            </label>
                            {saveAddress && (
                                <label className="flex items-center gap-2 cursor-pointer ml-5">
                                    <input
                                        type="checkbox"
                                        checked={isMainAddress}
                                        onChange={(e) => setIsMainAddress(e.target.checked)}
                                        className="w-3.5 h-3.5"
                                    />
                                    <span className="text-xs text-gray-500">{t('cart.mainAddress')}</span>
                                </label>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleUseAddress}
                            className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                        >
                            {t('cart.useThisAddress')}
                        </button>
                        <button
                            onClick={() => { setShowNewAddress(false); setNewAddress({ street: '', city: '', postalCode: '', country: '' }); }}
                            className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {/* Selected address display */}
            {selectedAddress && !showNewAddress && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('cart.shippingTo')}</p>
                    <p className="text-sm font-medium text-black">{selectedAddress.street}</p>
                    <p className="text-xs text-gray-500">{selectedAddress.city}, {selectedAddress.postalCode}</p>
                    <p className="text-xs text-gray-500">{selectedAddress.country}</p>
                </div>
            )}
        </div>
    );
};

export default ShippingAddressSelector;