import axiosInstance from '../../api/axiosInstance';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {getCoupons} from "../../api/couponApi.js";
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import ResponsiveTable from "../../components/admin/ResponsiveTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import FormField from "../../components/form/FormField.jsx";
import { inputClass } from "../../components/form/inputStyles.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { required, positiveNumber } from "../../utils/validators.js";
import { useTranslation } from 'react-i18next';
import {useCurrency} from "../../context/CurrencyContext.jsx";
import { applyServerErrors } from '../../utils/validationUtils';

const EMPTY_COUPON = { code: '', discountType: 'PERCENTAGE', discountValue: '', usageLimit: '', expiresAt: '' };
const couponRules = {
    code: [required],
    discountValue: [required, positiveNumber],
    usageLimit: [required, positiveNumber],
};

const AdminCoupons = () => {
    const { t } = useTranslation();
    const { format } = useCurrency();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const form = useFormValidation(EMPTY_COUPON, couponRules);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.submit()) return;

        try {
            await axiosInstance.post('/coupons', {
                ...form.values,
                discountValue: parseFloat(form.values.discountValue),
                usageLimit: parseInt(form.values.usageLimit),
                expiresAt: form.values.expiresAt || null,
            });
            toast.success(t('messages.couponCreated'));
            setShowForm(false);
            form.reset(EMPTY_COUPON);
            fetchCoupons();
        } catch (error) {
            if (!applyServerErrors(error, t, form.setErrors)) {
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

    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
            <AdminPageHeader
                title={t('admin.coupons')}
                subtitle={t('admin.manageCoupons')}
                buttonLabel={showForm ? t('admin.cancel') : t('admin.newCoupon')}
                onButtonClick={() => { setShowForm(v => !v); form.reset(EMPTY_COUPON); }}
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
                    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="code" name="code" label={t('admin.code')} required error={form.errors.code}>
                            <input
                                id="code"
                                type="text"
                                name="code"
                                value={form.values.code}
                                onChange={form.handleChange}
                                onBlur={form.handleBlur}
                                aria-invalid={!!form.errors.code}
                                aria-describedby={form.errors.code ? 'code-error' : undefined}
                                className={inputClass(!!form.errors.code)}
                                placeholder="SUMMER20"
                            />
                        </FormField>

                        <div>
                            <label className={labelClass} htmlFor="discountType">{t('admin.discountType')}</label>
                            <select
                                id="discountType"
                                name="discountType"
                                value={form.values.discountType}
                                onChange={form.handleChange}
                                className={inputClass(false)}
                            >
                                <option value="PERCENTAGE">{t('admin.percentageDiscount')}</option>
                                <option value="FIXED">{t('admin.fixedAmount')}</option>
                            </select>
                        </div>

                        <FormField
                            id="discountValue"
                            name="discountValue"
                            label={`${t('admin.discountValue')} ${form.values.discountType === 'PERCENTAGE' ? '(%)' : '($)'}`}
                            required
                            error={form.errors.discountValue}
                        >
                            <input
                                id="discountValue"
                                type="number"
                                name="discountValue"
                                value={form.values.discountValue}
                                onChange={form.handleChange}
                                onBlur={form.handleBlur}
                                aria-invalid={!!form.errors.discountValue}
                                aria-describedby={form.errors.discountValue ? 'discountValue-error' : undefined}
                                className={inputClass(!!form.errors.discountValue)}
                                placeholder={form.values.discountType === 'PERCENTAGE' ? '10' : '20'}
                                step="0.01"
                            />
                        </FormField>

                        <FormField id="usageLimit" name="usageLimit" label={t('admin.usageLimit')} required error={form.errors.usageLimit}>
                            <input
                                id="usageLimit"
                                type="number"
                                name="usageLimit"
                                value={form.values.usageLimit}
                                onChange={form.handleChange}
                                onBlur={form.handleBlur}
                                aria-invalid={!!form.errors.usageLimit}
                                aria-describedby={form.errors.usageLimit ? 'usageLimit-error' : undefined}
                                className={inputClass(!!form.errors.usageLimit)}
                                placeholder="100"
                            />
                        </FormField>

                        <div>
                            <label className={labelClass} htmlFor="expiresAt">{t('admin.expiresAt')}</label>
                            <input
                                id="expiresAt"
                                type="datetime-local"
                                name="expiresAt"
                                value={form.values.expiresAt}
                                onChange={form.handleChange}
                                className={inputClass(false)}
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