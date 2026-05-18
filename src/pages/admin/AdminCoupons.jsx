import axiosInstance from '../../api/axiosInstance';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {getCoupons} from "../../api/couponApi.js";
import AdminSearchFilter from "./AdminSearchFilter.jsx";

const AdminCoupons = () => {
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
            toast.error('Failed to load coupons, error: ' + e.message);
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
            toast.success('Coupon created');
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
            toast.error(error.response?.data?.message || 'Failed to create coupon');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await axiosInstance.delete(`/coupons/${id}`);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (e) {
            toast.error('Failed to delete coupon, error: ' + e.message || 'Unknown error');
        }
    };

    const handleToggle = async (id) => {
        try {
            await axiosInstance.patch(`/coupons/${id}/toggle`);
            fetchCoupons();
        } catch (e) {
            toast.error('Failed to toggle coupon, error: ' + e.message || 'Unknown error');
        }
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        Coupons
                    </h1>
                    <p className="text-sm text-gray-500">Manage discount coupons</p>
                </div>
                <button
                    onClick={() => showForm ? setShowForm(false) : setShowForm(true)}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Coupon'}
                </button>
            </div>

            {!showForm && (
                <AdminSearchFilter
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    setPage={setPage}
                    searchPlaceholder="Search products by code..."
                />
            )}

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        New Coupon
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Code</label>
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
                            <label className={labelClass}>Discount Type</label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount ($)</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
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
                            <label className={labelClass}>Usage Limit</label>
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
                            <label className={labelClass}>Expires At (optional)</label>
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
                                Create Coupon
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons table */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
            ) : coupons.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">No coupons yet</p>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Code</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Type</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Value</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Usage</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Expires</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Status</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-bold text-black">{coupon.code}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{coupon.discountType}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-black">
                                    {coupon.discountType === 'PERCENTAGE'
                                        ? `${coupon.discountValue}%`
                                        : `$${coupon.discountValue}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {coupon.usageCount} / {coupon.usageLimit}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                    {coupon.expiresAt
                                        ? new Date(coupon.expiresAt).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold uppercase px-2 py-1 ${
                                            coupon.active 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {coupon.active ? 'Active' : 'Inactive'}
                                        </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleToggle(coupon.id)}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            {coupon.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-200">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="text-sm font-medium px-4 py-1.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="text-sm font-medium px-4 py-1.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;