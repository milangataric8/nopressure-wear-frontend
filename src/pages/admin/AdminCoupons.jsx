import axiosInstance from '../../api/axiosInstance';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {getCoupons} from "../../api/couponApi.js";
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useTranslation } from 'react-i18next';
import {useCurrency} from "../../context/CurrencyContext.jsx";

const AdminCoupons = () => {
    const { t } = useTranslation();
    const { format } = useCurrency();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        usageLimit: '',
        expiresAt: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeFilter, setActiveFilter] = useState(null);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };

            if (searchQuery) params.search = searchQuery;
            if (activeFilter !== null) params.active = activeFilter;

            const response = await getCoupons(params);

            setCoupons(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchCoupons();
    }, [page, searchQuery, activeFilter]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/coupons', {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                usageLimit: parseInt(formData.usageLimit),
                expiresAt: formData.expiresAt || null,
            });
            toast.success(t('messages.couponCreated'));
            setShowForm(false);
            setFormData({
                code: '',
                discountType: 'PERCENTAGE',
                discountValue: '',
                usageLimit: '',
                expiresAt: '',
            });
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('messages.confirmDelete'))) return;
        try {
            await axiosInstance.delete(`/coupons/${id}`);
            toast.success(t('messages.couponDeleted'));
            fetchCoupons();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const handleToggle = async (id) => {
        try {
            await axiosInstance.patch(`/coupons/${id}/toggle`);
            fetchCoupons();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
        }
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <AdminPageHeader
                title={t('admin.coupons')}
                subtitle={t('admin.manageCoupons')}
                buttonLabel={showForm ? t('admin.cancel') : t('admin.newCoupon')}
                onButtonClick={() => showForm ? setShowForm(false) : setShowForm(true)}
            />

            {!showForm && (
                <AdminSearchFilter
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    setPage={setPage}
                    searchPlaceholder={t('admin.searchCoupons')}
                />
            )}

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.newCoupon')}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('admin.code')}</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="SUMMER20"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.discountType')}</label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="PERCENTAGE">{t('admin.percentageDiscount')}</option>
                                <option value="FIXED">{t('admin.fixedAmount')}</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>
                                {t('admin.discountValue')} {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '20'}
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.usageLimit')}</label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="100"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.expiresAt')}</label>
                            <input
                                type="datetime-local"
                                name="expiresAt"
                                value={formData.expiresAt}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {t('common.create')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons table */}
            {loading && <LoadingSpinner />}
            {
                loading && <LoadingSpinner height="h-32" />
            }
            { coupons.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">{t('admin.noCoupons')}</p>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.code')}</th>
                            <th className="hidden md:table-cell text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.type')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.value')}</th>
                            <th className="hidden md:table-cell text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.usage')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('profile.expires')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('order.status')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-bold text-black">{coupon.code}</td>
                                <td className="hidden md:table-cell px-4 py-3 text-xs text-gray-500">{coupon.discountType}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-black">
                                    {coupon.discountType === 'PERCENTAGE'
                                        ? `${coupon.discountValue}%`
                                        : format(coupon.discountValue)}
                                </td>
                                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                                    {coupon.usageCount} / {coupon.usageLimit}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                    {coupon.expiresAt
                                        ? new Date(coupon.expiresAt).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge active={coupon.active} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleToggle(coupon.id)}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            {coupon.active ? t('admin.deactivate') : t('admin.activate')}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                                        >
                                            {t('admin.delete')}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;