import axiosInstance from "../../api/axiosInstance.js";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
    getCategories,
    createCategory,
    updateCategory
} from '../../api/categoryApi';
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import RichTextEditor from '../../components/common/RichTextEditor';
import React from 'react';
import { useTranslation } from 'react-i18next';

const AdminCategories = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeFilter, setActiveFilter] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState([]);

    const isSearching = searchQuery && searchQuery.trim() !== '';

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };

            if (searchQuery) params.search = searchQuery;
            if (activeFilter !== null) params.active = activeFilter;

            const response = await getCategories(params);
            setCategories(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchCategories();
    }, [page, searchQuery, activeFilter]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                parentId: formData.parentId ? parseInt(formData.parentId) : null,
            };

            if (editingCategory) {
                await updateCategory(editingCategory.id, payload);
                toast.success(t('messages.categoryUpdated'));
            } else {
                await createCategory(payload);
                toast.success(t('messages.categoryCreated'));
            }

            resetForm();
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            parentId: category.parentId || '',
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggle = async (id) => {
        try {
            await axiosInstance.patch(`/categories/${id}/toggle`);
            fetchCategories();
            localStorage.setItem('categories-updated', Date.now().toString());
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', parentId: '' });
        setEditingCategory(null);
        setShowForm(false);
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <AdminPageHeader
                title={t('admin.categories')}
                subtitle={t('admin.manageCategories')}
                buttonLabel={showForm ? t('admin.cancel') : t('admin.newCategory')}
                onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
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
                    searchPlaceholder={t('admin.searchCategories')}
                />
            )}

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingCategory ? t('admin.edit') : t('admin.newCategory')}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('product.name')}</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Category name"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.parentCategory')}</label>
                            <select
                                name="parentId"
                                value={formData.parentId}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">{t('admin.noParent')}</option>
                                {categories
                                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                                    .map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>{t('admin.description')}</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                placeholder="Category description..."
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {editingCategory ? t('common.update') : t('common.create')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                {t('admin.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories table */}
            {loading && <LoadingSpinner />}
            {
                loading && <LoadingSpinner height="h-32" />
            }
            { categories.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">{t('admin.noCategories')}</p>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.category')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('order.status')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">{t('admin.actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isSearching ? (
                            // Flat list when searching
                            categories.map(cat => (
                                <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-black">{cat.name}</p>
                                            {cat.parentId && (
                                                <span className="text-xs text-gray-400">
                                                    ({categories.find(c => c.id === cat.parentId)?.name || t('admin.subcategory')})
                                                </span>
                                            )}
                                        </div>
                                        {cat.description && (
                                            <p className="text-xs text-gray-400">{cat.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge active={cat.active} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="text-xs text-gray-500 hover:text-black underline"
                                            >
                                                {t('admin.edit')}
                                            </button>
                                            <button
                                                onClick={() => handleToggle(cat.id)}
                                                className="text-xs text-gray-500 hover:text-black underline"
                                            >
                                                {cat.active ? t('admin.deactivate') : t('admin.activate')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Grouped list when not searching
                            categories.filter(cat => !cat.parentId).map(cat => {
                                const subcategories = categories.filter(c => c.parentId === cat.id);
                                const isExpanded = expandedCategories.includes(cat.id);

                                return (
                                    <React.Fragment key={cat.id}>
                                        <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-black">{cat.name}</p>
                                                    {subcategories.length > 0 && (
                                                        <button
                                                            onClick={() => setExpandedCategories(prev =>
                                                                prev.includes(cat.id)
                                                                    ? prev.filter(id => id !== cat.id)
                                                                    : [...prev, cat.id]
                                                            )}
                                                            className="text-gray-400 hover:text-black transition-colors"
                                                        >
                                                            {isExpanded ? '▾' : '▸'}
                                                        </button>
                                                    )}
                                                </div>
                                                {cat.description && (
                                                    <p className="text-xs text-gray-400">{cat.description}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge active={cat.active} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(cat)} className="text-xs text-gray-500 hover:text-black underline">{t('admin.edit')}</button>
                                                    <button onClick={() => handleToggle(cat.id)} className="text-xs text-gray-500 hover:text-black underline">
                                                        {cat.active ? t('admin.deactivate') : t('admin.activate')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {isExpanded && subcategories.map(sub => (
                                            <tr key={sub.id} className="border-b border-gray-100 bg-gray-50">
                                                <td className="px-4 py-2 pl-10">
                                                    <p className="text-xs text-gray-600">{sub.name}</p>
                                                    {sub.description && (
                                                        <p className="text-xs text-gray-400">{sub.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2"><StatusBadge active={sub.active} /></td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => handleEdit(sub)} className="text-xs text-gray-500 hover:text-black underline">{t('admin.edit')}</button>
                                                        <button onClick={() => handleToggle(sub.id)} className="text-xs text-gray-500 hover:text-black underline">
                                                            {sub.active ? t('admin.deactivate') : t('admin.activate')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })
                        )}
                        </tbody>
                    </table>

                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                </div>
            )}
        </div>
    );
};

export default AdminCategories;