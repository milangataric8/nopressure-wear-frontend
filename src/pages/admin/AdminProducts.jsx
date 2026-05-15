import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    activateDeactivateProduct,
    getProductById,
    addProductImage,
    deleteProductImage
} from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getImageUrl } from "../../utils/imageUtils.js";
import { uploadImage, uploadVideo } from '../../api/uploadApi';

const AdminProducts = () => {
    const navigate = useNavigate();
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
        videoUrl: '',
        categoryId: '',
    });
    const [pendingImages, setPendingImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };
            if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery;
            if (categoryFilter) params.categoryId = categoryFilter;
            const response = await getProducts(params);
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error('Failed to load products, error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data.content || response.data);
        } catch (e) {
            console.log('Failed to load categories, error: ' + e.message);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [page, searchQuery, categoryFilter]);

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
                const response = await createProduct(payload);
                const savedProduct = response.data;

                for (const imageUrl of pendingImages) {
                    await addProductImage(savedProduct.id, {
                        imageUrl,
                        displayOrder: pendingImages.indexOf(imageUrl),
                        isPrimary: false
                    });
                }

                toast.success('Product created');
            }

            setPendingImages([]);
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
            videoUrl: product.videoUrl || '',
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
            toast.error('Failed to delete product, error: ' + e.message);
        }
    };

    const handleToggle = async (id) => {
        try {
            await activateDeactivateProduct(id);
            fetchProducts();
        } catch (e) {
            toast.error('Failed to toggle product, error: ' + e.message);
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
            videoUrl: '',
            colorName: '',
            colorHex: '#000000',
            categoryId: '',
        });
        setEditingProduct(null);
        setPendingImages([]);
        setShowForm(false);
    };

    const handleMainImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        try {
            const response = await uploadImage(file);
            setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
            toast.success('Main image uploaded');
        } catch (e) {
            toast.error('Failed to upload image, error: ' + e.message);
        }
    };

    const handleAddImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        try {
            const uploadResponse = await uploadImage(file);
            const url = uploadResponse.data.url;

            if (editingProduct) {
                await addProductImage(editingProduct.id, {
                    imageUrl: url,
                    displayOrder: editingProduct.images?.length || 0,
                    isPrimary: false
                });
                toast.success('Image added');
                const updated = await getProductById(editingProduct.id);
                setEditingProduct(updated.data);
                fetchProducts();
            } else {
                setPendingImages(prev => [...prev, url]);
            }
        } catch (e) {
            toast.error('Failed to add image, error: ' + e.message);
        }
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await deleteProductImage(imageId);
            toast.success('Image deleted');
            setEditingProduct(prev => ({
                ...prev,
                images: prev.images.filter(img => img.id !== imageId)
            }));
        } catch (e) {
            toast.error('Failed to delete image, error: ' + e.message);
        }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        try {
            const response = await uploadVideo(file);
            setFormData(prev => ({ ...prev, videoUrl: response.data.url }));
            toast.success('Video uploaded');
        } catch (e) {
            toast.error('Failed to upload video, error: ' + e.message);
        }
    };
    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">Products</h1>
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

            {/* Search */}
            {!showForm && (
                <form
                    onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(0); }}
                    className="flex gap-3 mb-6"
                >
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search products by name or SKU"
                        className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                    <button
                        type="submit"
                        className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                    >
                        Search
                    </button>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(0); }}
                            className="border border-gray-300 text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </form>
            )}

            {!showForm && (
                <div className="mb-6 border border-gray-200">
                    {/* Root categories */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => { setCategoryFilter(null); setPage(0); }}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors border-r border-gray-200 ${
                                categoryFilter === null
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black'
                            }`}
                        >
                            All
                        </button>
                        {categories.filter(cat => !cat.parentId).map(cat => {
                            const subcats = categories.filter(c => c.parentId === cat.id);
                            const isSelected = categoryFilter === cat.id || subcats.some(s => s.id === categoryFilter);

                            return (
                                <div key={cat.id} className="flex-1 relative border-r border-gray-200 last:border-r-0">
                                    <button
                                        onClick={() => { setCategoryFilter(cat.id); setPage(0); }}
                                        className={`w-full py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                            isSelected
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black'
                                        }`}
                                    >
                                        {cat.name}
                                        {subcats.length > 0 && (
                                            <span className="ml-1 text-xs opacity-60">▾</span>
                                        )}
                                    </button>

                                    {/* Dropdown subcategories */}
                                    {isSelected && subcats.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-200 z-10 shadow-sm">
                                            {subcats.map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => { setCategoryFilter(sub.id); setPage(0); }}
                                                    className={`w-full py-2 text-xs uppercase tracking-wide transition-colors border-b border-gray-100 last:border-b-0 ${
                                                        categoryFilter === sub.id
                                                            ? 'bg-gray-100 text-black font-semibold'
                                                            : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                                                    }`}
                                                >
                                                    {sub.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingProduct ? 'Edit Product' : 'New Product'}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
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

                        {/* SKU */}
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

                        {/* Price */}
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

                        {/* Stock */}
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

                        {/* Category */}
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

                        {/* Main Image */}
                        <div className="md:col-span-2">
                            <label className={labelClass}>Main Image</label>
                            <label className="cursor-pointer block">
                                <div className="border border-gray-300 text-center py-2.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                                    Upload Main Image
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageUpload}
                                    className="hidden"
                                />
                            </label>
                            {formData.imageUrl && (
                                <img
                                    src={getImageUrl(formData.imageUrl)}
                                    alt="Main"
                                    className="mt-2 h-32 object-cover border border-gray-200"
                                />
                            )}
                        </div>

                        {/* Additional Images */}
                        <div className="md:col-span-2">
                            <label className={labelClass}>Additional Images (max 5)</label>
                            <div className="flex gap-2 flex-wrap mb-3">
                                {editingProduct ? (
                                    editingProduct.images?.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img
                                                src={getImageUrl(img.imageUrl)}
                                                alt="Product"
                                                className="w-16 h-16 object-cover border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    pendingImages.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={getImageUrl(url)}
                                                alt="Product"
                                                className="w-16 h-16 object-cover border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPendingImages(prev => prev.filter((_, i) => i !== index))}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <label className="cursor-pointer block">
                                <div className="border border-gray-300 text-center py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                                    + Add Image
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAddImage}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Video */}
                        <div className="md:col-span-2">
                            <label className={labelClass}>Product Video (optional)</label>
                            {formData.videoUrl && (
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-xs text-green-600">✓ Video uploaded</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                                        className="text-xs text-red-400 hover:text-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            <label className="cursor-pointer block">
                                <div className="border border-gray-300 text-center py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                                    Upload Video
                                </div>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Description */}
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

                        {/* Submit */}
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
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Image</th>
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
                            <tr
                                key={product.id}
                                onClick={() => navigate(`/products/${product.id}`)}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-4 py-3">
                                    <div className="w-16 h-16 border-2 border-transparent hover:border-black transition-colors overflow-hidden block">
                                        {product.imageUrl ? (
                                            <img
                                                src={getImageUrl(product.imageUrl)}
                                                alt={product.colorName || 'Variant'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full"
                                                style={{ backgroundColor: product.colorHex || '#ccc' }}
                                            />
                                        )}
                                    </div>
                                </td>
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
                                            onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggle(product.id); }}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            {product.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
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

export default AdminProducts;