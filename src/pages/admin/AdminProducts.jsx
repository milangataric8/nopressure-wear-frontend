import { useNavigate } from 'react-router-dom';
import {useState, useEffect, useCallback} from 'react';
import { toast } from 'react-toastify';
import {
    getProducts,
    createProduct,
    updateProduct,
    activateDeactivateProduct,
    getProductById,
    addProductImage,
    deleteProductImage,
    getProductFilters
} from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getImageUrl } from "../../utils/imageUtils.js";
import { uploadImage, uploadVideo } from '../../api/uploadApi';
import { addProductAttribute, deleteProductAttribute } from '../../api/productAttributeApi.js';
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const AdminProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pendingImages, setPendingImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [removeBg, setRemoveBg] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const [brandFilter, setBrandFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [newAttrKey, setNewAttrKey] = useState('');
    const [newAttrValue, setNewAttrValue] = useState('');
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
    const COLOR_PALETTE = [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Black', hex: '#000000' },
        { name: 'Gray', hex: '#808080' },
        { name: 'Silver', hex: '#C0C0C0' },
        { name: 'Red', hex: '#FF0000' },
        { name: 'Blue', hex: '#0000FF' },
        { name: 'Navy', hex: '#000080' },
        { name: 'Green', hex: '#008000' },
        { name: 'Yellow', hex: '#FFFF00' },
        { name: 'Orange', hex: '#FF8C00' },
        { name: 'Purple', hex: '#800080' },
        { name: 'Pink', hex: '#FFC0CB' },
        { name: 'Gold', hex: '#FFD700' },
        { name: 'Brown', hex: '#8B4513' },
        { name: 'Beige', hex: '#F5F5DC' },
        { name: 'Midnight Blue', hex: '#191970' },
        { name: 'Space Gray', hex: '#4A4A4A' },
        { name: 'Rose Gold', hex: '#B76E79' },
    ];

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };

            if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery;
            if (categoryFilter) params.categoryId = categoryFilter;
            if (activeFilter !== null) params.active = activeFilter;
            if (brandFilter) params.brand = brandFilter;
            if (colorFilter) params.colorName = colorFilter;

            const response = await getProducts(params);
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, categoryFilter, activeFilter, brandFilter, colorFilter]);

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
    }, [page, searchQuery, categoryFilter, activeFilter, brandFilter, colorFilter])

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        getProductFilters().then(r => {
            setAvailableBrands(r.data.brands || []);
            setAvailableColors(r.data.colors || []);
        }).catch(() => {});
    }, []);

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
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to save product');
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
            colorName: product.colorName || '',
            colorHex: product.colorHex || '#000000',
            brand: product.brand || '',
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggle = async (id) => {
        try {
            await activateDeactivateProduct(id);
            fetchProducts();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to toggle product')
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
            brand: '',
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
            const response = await uploadImage(file, removeBg);
            setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
            if (response.data.warning) {
                toast.warning('Image uploaded but background removal failed');
            } else {
                toast.success(removeBg ? 'Image uploaded with background removed' : 'Main image uploaded');
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to upload image');
        }
    };

    const handleAddImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        try {
            const uploadResponse = await uploadImage(file, removeBg);
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
            toast.error(e.response?.data?.message || 'Failed to add image');
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
            toast.error(e.response?.data?.message || 'Failed to delete image');
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
            toast.error(e.response?.data?.message || 'Failed to upload video');
        }
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <AdminPageHeader
                title="Products"
                subtitle="Manage your product catalog"
                buttonLabel={showForm ? 'Cancel' : '+ New Product'}
                onButtonClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                            setEditingProduct(null);
                        }
                    }
                }
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
                    searchPlaceholder="Search products by name or SKU..."
                />
            )}

            <div className="flex items-center justify-between mb-6 gap-2 md:gap-4">
                <div className="flex w-1/3">
                    {!showForm && availableColors.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap items-center">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-2">Colors:</span>
                            {availableColors.map(color => (
                                <button
                                    key={color.colorName}
                                    onClick={() => { setColorFilter(prev => prev === color.colorName ? '' : color.colorName); setPage(0); }}
                                    className={`w-6 h-6 rounded-full border border-gray-300 hover:border-gray-500 transition-colors`}
                                    style={{ backgroundColor: color.colorHex }}
                                    title={color.colorName}
                                >
                                    {colorFilter === color.colorName && (
                                        <span className="flex items-center justify-center h-full">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex w-10/12">
                    {!showForm && availableBrands.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-2">Brands:</span>
                            {availableBrands.map(brand => (
                                <button
                                    key={brand}
                                    onClick={() => { setBrandFilter(prev => prev === brand ? '' : brand); setPage(0); }}
                                    className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                                        brandFilter === brand
                                            ? 'bg-black text-white border-black'
                                            : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                                    }`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {!showForm && (
                <div className="mb-6 border border-gray-200">
                    {/* Root categories */}
                    <div className="flex border-b border-gray-200">
                        {categories.filter(cat => !cat.parentId).map(cat => {
                            const subcats = categories.filter(c => c.parentId === cat.id);
                            const isSelected = categoryFilter === cat.id || subcats.some(s => s.id === categoryFilter);

                            return (
                                <div key={cat.id} className="flex-1 relative border-r border-gray-200 last:border-r-0">
                                    <button
                                        onClick={() => {
                                            setCategoryFilter(isSelected ? null : cat.id);
                                            setPage(0);
                                        }}
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
                                                    onClick={() => {
                                                        setCategoryFilter(prev => prev === sub.id ? cat.id : sub.id);
                                                        setPage(0);
                                                    }}
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

                        <div>
                            <label className={labelClass}>Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Apple, Samsung..."
                            />
                        </div>

                        {/* Color */}
                        <div className="md:col-span-2 flex justify-center">
                            <label className={labelClass}>Color</label>
                        </div>
                        <div className="md:col-span-2 flex justify-center">
                            <div className="flex gap-3 rounded-4xl">
                                {COLOR_PALETTE.map(color => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            colorName: color.name,
                                            colorHex: color.hex
                                        }))}
                                        className={`w-10 h-10 rounded-full border-2 transition-colors ${
                                            formData.colorName === color.name
                                                ? 'border-black'
                                                : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    >
                                        {formData.colorName === color.name && (
                                            <span className="flex items-center justify-center h-full">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                                     stroke={
                                                        ['#FFFFFF', '#FFFF00', '#FFD700', '#FFC0CB', '#F5F5DC', '#C0C0C0']
                                                         .includes(color.hex) ? 'black' : 'white'
                                                    }
                                                     strokeWidth="4">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-center">
                            {formData.colorName && (
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full border border-gray-300"
                                        style={{ backgroundColor: formData.colorHex }}
                                    />
                                    <span className="text-sm text-black font-medium">{formData.colorName}</span>
                                    <span className="text-xs text-gray-400">{formData.colorHex}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, colorName: '', colorHex: '#000000' }))}
                                        className="text-xs text-red-400 hover:text-red-600 underline ml-2"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Product Attributes — only when editing */}
                        {editingProduct && (
                            <div className="md:col-span-2">
                                <label className={labelClass}>Custom Attributes</label>

                                {/* Existing attributes */}
                                <div className="flex gap-2 flex-wrap mb-3">
                                    {editingProduct.attributes?.map(attr => (
                                        <div key={attr.id} className="flex items-center gap-2 border border-gray-200 px-3 py-1.5">
                                            <span className="text-xs text-gray-500">{attr.key}:</span>
                                            <span className="text-xs font-medium text-black">{attr.value}</span>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        await deleteProductAttribute(attr.id);
                                                        toast.success('Attribute removed');
                                                        const updated = await getProductById(editingProduct.id);
                                                        setEditingProduct(updated.data);
                                                    } catch (e) {
                                                        toast.error(e.response?.data?.message || 'Failed to remove attribute');
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-600 text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add new attribute */}
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">Key</label>
                                        <input
                                            type="text"
                                            value={newAttrKey}
                                            onChange={(e) => setNewAttrKey(e.target.value)}
                                            className={inputClass}
                                            placeholder="e.g. material"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">Value</label>
                                        <input
                                            type="text"
                                            value={newAttrValue}
                                            onChange={(e) => setNewAttrValue(e.target.value)}
                                            className={inputClass}
                                            placeholder="e.g. Silicone"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!newAttrKey || !newAttrValue) {
                                                toast.error('Fill in both fields');
                                                return;
                                            }
                                            try {
                                                await addProductAttribute(editingProduct.id, {
                                                    key: newAttrKey,
                                                    value: newAttrValue
                                                });
                                                toast.success('Attribute added');
                                                setNewAttrKey('');
                                                setNewAttrValue('');
                                                const updated = await getProductById(editingProduct.id);
                                                setEditingProduct(updated.data);
                                            } catch (e) {
                                                toast.error(e.response?.data?.message || 'Failed to add attribute');
                                            }
                                        }}
                                        className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2.5 hover:bg-gray-800"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className={labelClass}>Main Image</label>
                            <div className="flex items-center gap-3 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={removeBg}
                                        onChange={(e) => setRemoveBg(e.target.checked)}
                                        className="w-3.5 h-3.5"
                                    />
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        Remove background
                                    </span>
                                </label>
                            </div>
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
            {loading && <LoadingSpinner />}
            {
                loading && <LoadingSpinner height="h-32" />
            }
            {(
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">Image</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">Product</th>
                            <th className="hidden md:table-cell text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">SKU</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">Price</th>
                            <th className="hidden md:table-cell text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">Stock</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">Status</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map(product => (
                            <tr
                                key={product.id}
                                onClick={() => navigate(`/products/${product.id}`)}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-3 py-3">
                                    <div className="w-13 h-13 border-2 border-transparent transition-colors overflow-hidden block">
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
                                <td className="px-3 py-3">
                                    <p className="text-xs font-semibold text-black">{product.name}</p>
                                    <p className="text-xs text-gray-400">{product.categoryName || 'No category'}</p>
                                </td>
                                <td className="hidden md:table-cell px-3 py-3 text-xs text-gray-500">{product.sku}</td>
                                <td className="px-3 py-3 text-xs font-semibold text-black">${product.price}</td>
                                <td className="hidden md:table-cell px-3 py-3 text-xs text-black">{product.stockQuantity}</td>
                                <td className="px-3 py-3">
                                    <StatusBadge active={product.active} />
                                </td>
                                <td className="px-3 py-3">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-3">
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

export default AdminProducts;