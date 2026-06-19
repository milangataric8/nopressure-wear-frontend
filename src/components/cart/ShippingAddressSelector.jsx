import { useTranslation } from 'react-i18next';

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
                                 }) => {
    const { t } = useTranslation();

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors";

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
                            onClick={() => { setSelectedAddress(address); setShowNewAddress(false); }}
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
                <button
                    onClick={() => { setShowNewAddress(true); setSelectedAddress(null); }}
                    className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
                >
                    {t('cart.addNewAddress')}
                </button>
            ) : (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder={t('cart.street')}
                        className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            placeholder={t('cart.city')}
                            className="border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                        <input
                            type="text"
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                            placeholder={t('cart.postalCode')}
                            className="border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                    </div>
                    <input
                        type="text"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                        placeholder={t('cart.country')}
                        className={inputClass}
                    />

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
                            onClick={() => {
                                setSelectedAddress(newAddress);
                                setShowNewAddress(false);
                            }}
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