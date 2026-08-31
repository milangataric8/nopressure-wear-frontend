import axiosInstance from '../../api/axiosInstance';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {getCoupons} from "../../api/couponApi.js";
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import ResponsiveTable from "../../components/admin/ResponsiveTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useTranslation } from 'react-i18next';
import {useCurrency} from "../../context/CurrencyContext.jsx";
import { inputNormal, inputError, applyServerErrors, focusFirstError } from '../../utils/validationUtils';

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
    const [errors, setErrors] = useState({});
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const e = {};
        if (!formData.code?.trim()) e.code = t('validation.codeRequired');
        if (formData.discountValue === '' ||
            isNaN(parseFloat(formData.discountValue)) ||
            parseFloat(formData.discountValue) <= 0) {
            e.discountValue = t('validation.discountValueInvalid');
        }
        if (formData.usageLimit === '' ||
            isNaN(parseInt(formData.usageLimit)) ||
            parseInt(formData.usageLimit) <= 0) {
            e.usageLimit = t('validation.required');
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            focusFirstError();
            return;
        }

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
            setErrors({});
            fetchCoupons();
        } catch (error) {
            if (!applyServerErrors(error, t, setErrors)) {
                toast.error(error.response?.data?.message || t('messages.failedToSave'));
            }
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
            <AdminPageHeader
                title={t('admin.coupons')}
                subtitle={t('admin.manageCoupons')}
                buttonLabel={showForm ? t('admin.cancel') : t('admin.newCoupon')}
                onButtonClick={() => { setShowForm(v => !v); setErrors({}); }}
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
                            <label className={labelClass} htmlFor="coupon-code">{t('admin.code')}</label>
                            <input
                                id="coupon-code"
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                aria-invalid={!!errors.code}
                                aria-describedby={errors.code ? 'coupon-code-error' : undefined}
                                className={`${inputClass} ${errors.code ? inputError : inputNormal}`}
                                placeholder="SUMMER20"
                            />
                            {errors.code && <p id="coupon-code-error" className="text-xs text-red-500 mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.discountType')}</label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                className={`${inputClass} ${inputNormal}`}
                            >
                                <option value="PERCENTAGE">{t('admin.percentageDiscount')}</option>
                                <option value="FIXED">{t('admin.fixedAmount')}</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="coupon-discountValue">
                                {t('admin.discountValue')} {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                            </label>
                            <input
                                id="coupon-discountValue"
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                aria-invalid={!!errors.discountValue}
                                aria-describedby={errors.discountValue ? 'coupon-discountValue-error' : undefined}
                                className={`${inputClass} ${errors.discountValue ? inputError : inputNormal}`}
                                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '20'}
                                step="0.01"
                            />
                            {errors.discountValue && <p id="coupon-discountValue-error" className="text-xs text-red-500 mt-1">{errors.discountValue}</p>}
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="coupon-usageLimit">{t('admin.usageLimit')}</label>
                            <input
                                id="coupon-usageLimit"
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                aria-invalid={!!errors.usageLimit}
                                aria-describedby={errors.usageLimit ? 'coupon-usageLimit-error' : undefined}
                                className={`${inputClass} ${errors.usageLimit ? inputError : inputNormal}`}
                                placeholder="100"
                            />
                            {errors.usageLimit && <p id="coupon-usageLimit-error" className="text-xs text-red-500 mt-1">{errors.usageLimit}</p>}
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
                                className="w-full sm:w-auto bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {t('common.create')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons table */}
            {loading ? (
                <LoadingSpinner height="h-32" />
            ) : (
                <ResponsiveTable
                    rows={coupons}
                    rowKey={(c) => c.id}
                    emptyMessage={t('admin.noCoupons')}
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    columns={[
                        {
                            key: 'code',
                            label: t('admin.code'),
                            primary: true,
                            render: (c) => <span className="text-sm font-bold text-black">{c.code}</span>,
                        },
                        {
                            key: 'type',
                            label: t('admin.type'),
                            hideOnMobile: true,
                            render: (c) => <span className="text-gray-500">{c.discountType}</span>,
                        },
                        {
                            key: 'value',
                            label: t('admin.value'),
                            render: (c) => (
                                <span className="text-sm font-semibold text-black">
                                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : format(c.discountValue)}
                                </span>
                            ),
                        },
                        {
                            key: 'usage',
                            label: t('admin.usage'),
                            hideOnMobile: true,
                            render: (c) => <span className="text-sm text-gray-500">{c.usageCount} / {c.usageLimit}</span>,
                        },
                        {
                            key: 'expires',
                            label: t('profile.expires'),
                            render: (c) => (
                                <span className="text-gray-500">
                                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                                </span>
                            ),
                        },
                        {
                            key: 'status',
                            label: t('order.status'),
                            render: (c) => <StatusBadge active={c.active} />,
                        },
                    ]}
                    actions={(c) => (
                        <>
                            <button
                                onClick={() => handleToggle(c.id)}
                                className="text-xs text-gray-500 hover:text-black transition-colors underline"
                            >
                                {c.active ? t('admin.deactivate') : t('admin.activate')}
                            </button>
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                            >
                                {t('admin.delete')}
                            </button>
                        </>
                    )}
                />
            )}
        </div>
    );
};

export default AdminCoupons;