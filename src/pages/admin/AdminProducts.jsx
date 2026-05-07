import ImageUpload from '../../components/common/ImageUpload';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    activateDeactivateProduct
} from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        sku: '',
        imageUrl: '',
        categoryId: '',
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await getProducts({ page, size: 10 });
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error('Failed to load products, error: ' + e.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (e) {
            console.log('Failed to load categories, error: ' + e.message || 'Unknown error');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [page]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stockQuantity),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
                toast.success('Product updated');
            } else {
                await createProduct(payload);
                toast.success('Product created');
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stockQuantity: product.stockQuantity,
            sku: product.sku,
            imageUrl: product.imageUrl || '',
            categoryId: product.categoryId || '',
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            toast.success('Product deleted');
            fetchProducts();
        } catch (e) {
            toast.error('Failed to delete product, error: ' + e.message || 'Unknown error');
        }
    };

    const handleToggle = async (id) => {
        try {
            await activateDeactivateProduct(id);
            fetchProducts();
        } catch (e) {
            toast.error('Failed to toggle coupon, error: ' + e.message || 'Unknown error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stockQuantity: '',
            sku: '',
            imageUrl: '',
            categoryId: '',
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        Products
                    </h1>
                    <p className="text-sm text-gray-500">Manage your product catalog</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                            setEditingProduct(null);
                        }
                    }}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Product'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingProduct ? 'Edit Product' : 'New Product'}
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
                                placeholder="Product name"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>SKU</label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="PROD-001"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Stock Quantity</label>
                            <input
                                type="number"
                                name="stockQuantity"
                                value={formData.stockQuantity}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Category</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">No category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Product Image</label>
                            <ImageUpload
                                currentImageUrl={formData.imageUrl}
                                onImageUploaded={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Product description"
                                rows={3}
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {editingProduct ? 'Update Product' : 'Create Product'}
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

            {/* Products table */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Product</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">SKU</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Price</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Stock</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Status</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-black">{product.name}</p>
                                        <p className="text-xs text-gray-400">{product.categoryName || 'No category'}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">{product.sku}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-black">${product.price}</td>
                                <td className="px-4 py-3 text-sm text-black">{product.stockQuantity}</td>
                                <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold uppercase px-2 py-1 ${
                                            product.active 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {product.active ? 'Active' : 'Inactive'}
                                        </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggle(product.id)}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            {product.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
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

                    {/* Pagination */}
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

export default AdminProducts;