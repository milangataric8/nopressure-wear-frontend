import axiosInstance from "../../api/axiosInstance.js";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
    getCategories,
    createCategory,
    updateCategory
} from '../../api/categoryApi';
import AdminSearchFilter from "./AdminSearchFilter.jsx";

const AdminCategories = () => {
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
            toast.error('Failed to load categories, error: ' + e.message || 'Unknown error');
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
                toast.success('Category updated');
            } else {
                await createCategory(payload);
                toast.success('Category created');
            }

            resetForm();
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save category');
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
            toast.error('Failed to toggle category, error: ' + e.message);
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
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        Categories
                    </h1>
                    <p className="text-sm text-gray-500">Manage product categories</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                            setEditingCategory(null);
                        }
                    }}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Product'}
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
                    searchPlaceholder="Search products by name or description..."
                />
            )}

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingCategory ? 'Edit Category' : 'New Category'}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Name</label>
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
                            <label className={labelClass}>Parent Category</label>
                            <select
                                name="parentId"
                                value={formData.parentId}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">No parent</option>
                                {categories
                                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                                    .map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Category description"
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories table */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">No categories yet</p>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Name</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Description</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Parent</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Subcategories</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map(category => (
                            <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-sm font-semibold text-black">{category.name}</p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {category.description || '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {category.parentName || '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {category.subcategories?.length > 0
                                        ? category.subcategories.map(s => s.name).join(', ')
                                        : '—'
                                    }
                                </td>
                                <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold uppercase px-2 py-1 ${
                                            category.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {category.active ? 'Active' : 'Inactive'}
                                        </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggle(category.id)}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            {category.active ? 'Deactivate' : 'Activate'}
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

export default AdminCategories;