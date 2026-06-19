import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
    getAllStoresForProduct,
    addProductToStore,
    removeProductFromStore,
    toggleProductStoreStock
} from '../../api/storeApi';

const StoreAvailabilityManager = ({ productId, allStores, productStores, setProductStores, inputClass }) => {
    const { t } = useTranslation();
    const [selectedStoreId, setSelectedStoreId] = useState('');

    const handleToggleStock = async (psId) => {
        try {
            await toggleProductStoreStock(psId);
            const updated = await getAllStoresForProduct(productId);
            setProductStores(updated.data);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToToggleStock'));
        }
    };

    const handleRemove = async (ps) => {
        try {
            await removeProductFromStore(productId, ps.storeLocationId);
            setProductStores(prev => prev.filter(s => s.id !== ps.id));
            toast.success(t('messages.storeRemoved'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToRemoveStore'));
        }
    };

    const handleAdd = async () => {
        if (!selectedStoreId) return;
        try {
            await addProductToStore(productId, {
                storeLocationId: parseInt(selectedStoreId),
                inStock: true
            });
            const updated = await getAllStoresForProduct(productId);
            setProductStores(updated.data);
            setSelectedStoreId('');
            toast.success(t('messages.storeAdded'));
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToAddStore'));
        }
    };

    return (
        <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                {t('admin.storeAvailability')}
            </label>
            <p className="text-xs text-gray-400 mb-3">
                {t('admin.selectStore')}
            </p>

            {/* Linked stores */}
            <div className="space-y-2 mb-3">
                {productStores.map(ps => (
                    <div key={ps.id} className="flex items-center justify-between border border-gray-200 px-3 py-2">
                        <div>
                            <p className="text-xs font-semibold text-black">{ps.storeName}</p>
                            <p className="text-xs text-gray-400">{ps.storeCity} — {ps.storeStreet}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleToggleStock(ps.id)}
                                className={`text-xs font-semibold uppercase px-2 py-0.5 ${
                                    ps.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {ps.inStock ? t('product.inStock') : t('product.soldOut')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRemove(ps)}
                                className="text-xs text-red-400 hover:text-red-600"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add store */}
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <select
                        value={selectedStoreId}
                        onChange={(e) => setSelectedStoreId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">{t('admin.selectStorePlaceholder')}</option>
                        {allStores
                            .filter(s => !productStores.some(ps => ps.storeLocationId === s.id))
                            .map(store => (
                                <option key={store.id} value={store.id}>
                                    {store.name} — {store.city}
                                </option>
                            ))}
                    </select>
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {t('store.addStore')}
                </button>
            </div>
        </div>
    );
};

export default StoreAvailabilityManager;