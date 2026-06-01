import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllStores, createStore, updateStore, toggleStore, deleteStore } from '../../api/storeApi';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const AdminStores = () => {
    const { t } = useTranslation();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStore, setEditingStore] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        street: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
        workingHours: '',
    });

    const fetchStores = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllStores();
            setStores(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStore) {
                await updateStore(editingStore.id, formData);
                toast.success(t('messages.storeUpdated'));
            } else {
                await createStore(formData);
                toast.success(t('messages.storeCreated'));
            }
            resetForm();
            fetchStores();
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const handleEdit = (store) => {
        setEditingStore(store);
        setFormData({
            name: store.name || '',
            street: store.street || '',
            city: store.city || '',
            postalCode: store.postalCode || '',
            country: store.country || '',
            phone: store.phone || '',
            email: store.email || '',
            workingHours: store.workingHours || '',
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggle = async (id) => {
        try {
            await toggleStore(id);
            fetchStores();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('messages.confirmDelete'))) return;
        try {
            await deleteStore(id);
            toast.success(t('messages.storeDeleted'));
            fetchStores();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            street: '',
            city: '',
            postalCode: '',
            country: '',
            phone: '',
            email: '',
            workingHours: '',
        });
        setEditingStore(null);
        setShowForm(false);
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <AdminPageHeader
                title={t('admin.storeLocations')}
                subtitle={t('admin.manageStoreLocations')}
                buttonLabel={showForm ? t('admin.cancel') : t('admin.newStore')}
                onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
            />

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingStore ? t('admin.edit') : t('admin.newStore')}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('admin.storeName')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange}
                                   className={inputClass} placeholder="Downtown Store" required />
                        </div>
                        <div>
                            <label className={labelClass}>{t('admin.street')}</label>
                            <input type="text" name="street" value={formData.street} onChange={handleChange}
                                   className={inputClass} placeholder="123 Main Street" required />
                        </div>
                        <div>
                            <label className={labelClass}>{t('cart.city')}</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange}
                                   className={inputClass} placeholder="Novi Sad" required />
                        </div>
                        <div>
                            <label className={labelClass}>{t('cart.postalCode')}</label>
                            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange}
                                   className={inputClass} placeholder="21000" />
                        </div>
                        <div>
                            <label className={labelClass}>{t('cart.country')}</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange}
                                   className={inputClass} placeholder="Serbia" required />
                        </div>
                        <div>
                            <label className={labelClass}>{t('admin.phone')}</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                   className={inputClass} placeholder="+381 21 123 456" />
                        </div>
                        <div>
                            <label className={labelClass}>{t('auth.email')}</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                   className={inputClass} placeholder="store@webshop.com" />
                        </div>
                        <div>
                            <label className={labelClass}>{t('admin.workingHours')}</label>
                            <input type="text" name="workingHours" value={formData.workingHours} onChange={handleChange}
                                   className={inputClass} placeholder="Mon-Fri: 9-20, Sat: 9-16" />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button type="submit"
                                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors">
                                {editingStore ? t('common.update') : t('common.create')}
                            </button>
                            <button type="button" onClick={resetForm}
                                    className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors">
                                {t('admin.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stores list */}
            {loading ? (
                <LoadingSpinner />
            ) : stores.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">{t('admin.noStoreLocations')}</p>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.storeLocations')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.address')}</th>
                            <th className="hidden md:table-cell text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.contact')}</th>
                            <th className="hidden md:table-cell text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.workingHours')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('order.status')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stores.map(store => (
                            <tr key={store.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-sm font-semibold text-black">{store.name}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-xs text-gray-600">{store.street}</p>
                                    <p className="text-xs text-gray-400">{store.city}, {store.postalCode}, {store.country}</p>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                    <p className="text-xs text-gray-500">{store.phone || '—'}</p>
                                    <p className="text-xs text-gray-400">{store.email || '—'}</p>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3 text-xs text-gray-500">
                                    {store.workingHours || '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge active={store.active} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleEdit(store)}
                                                className="text-xs text-gray-500 hover:text-black underline">
                                            {t('admin.edit')}
                                        </button>
                                        <button onClick={() => handleToggle(store.id)}
                                                className="text-xs text-gray-500 hover:text-black underline">
                                            {store.active ? t('admin.deactivate') : t('admin.activate')}
                                        </button>
                                        <button onClick={() => handleDelete(store.id)}
                                                className="text-xs text-red-400 hover:text-red-600 underline">
                                            {t('admin.delete')}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminStores;
