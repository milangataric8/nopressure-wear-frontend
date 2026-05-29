import axiosInstance from '../api/axiosInstance';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useTranslation } from 'react-i18next';

const AddressPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressData, setAddressData] = useState({
        street: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/addresses/user/${user.id}`);
            setAddresses(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load addresses');
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleChange = (e) => {
        setAddressData({ ...addressData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await axiosInstance.put(`/addresses/${editingAddress.id}`, {
                    ...addressData,
                    userId: user.id,
                });
                toast.success(t('messages.addressSaved'));
            } else {
                await axiosInstance.post('/addresses', {
                    ...addressData,
                    userId: user.id,
                });
                toast.success(t('messages.addressSaved'));
            }
            resetForm();
            fetchAddresses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setAddressData({
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            await axiosInstance.delete(`/addresses/${id}`);
            toast.success('Address deleted');
            fetchAddresses();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete address');
        }
    };

    const resetForm = () => {
        setAddressData({ street: '', city: '', postalCode: '', country: '' });
        setEditingAddress(null);
        setShowForm(false);
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => navigate('/profile')}
                    className="text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
                >
                    ← Back to Profile
                </button>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        {t('profile.addresses')}
                    </h1>
                    <p className="text-sm text-gray-500">{t('profile.addresses')}</p>
                </div>
                <button
                    onClick={() => {showForm ? resetForm() : setShowForm(true)}}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {showForm ? t('common.cancel') : t('cart.addNewAddress')}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-8">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingAddress ? t('common.edit') : t('cart.addNewAddress')}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>{t('cart.street')}</label>
                            <input
                                type="text"
                                name="street"
                                value={addressData.street}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Street and number"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>{t('cart.city')}</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={addressData.city}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="City"
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('cart.postalCode')}</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={addressData.postalCode}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="12345"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>{t('cart.country')}</label>
                            <input
                                type="text"
                                name="country"
                                value={addressData.country}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Country"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex-1 bg-black text-white text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-800 transition-colors"
                            >
                                {editingAddress ? t('common.update') : t('common.save')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 border border-gray-300 text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-50 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address list */}
            {loading && <LoadingSpinner />}
            {
                loading && <LoadingSpinner height="h-32" />
            }
            { addresses.length === 0 ? (
                <div className="border border-gray-200 p-12 text-center">
                    <p className="text-sm text-gray-400 mb-4">No addresses saved yet</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-xs font-semibold uppercase tracking-wide bg-black text-white px-6 py-2.5 hover:bg-gray-800 transition-colors"
                    >
                        Add Your First Address
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map(address => (
                        <div key={address.id} className="border border-gray-200 p-6 flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-black mb-1">
                                    {address.street}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {address.city}, {address.postalCode}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {address.country}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleEdit(address)}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    {t('common.edit')}
                                </button>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressPage;