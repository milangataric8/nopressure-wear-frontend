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
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import { useTranslation } from 'react-i18next';
import { getAllStoresForProduct, addProductToStore, removeProductFromStore, toggleProductStoreStock } from '../../api/storeApi';
import { getActiveStores } from '../../api/storeApi';
import Pagination from "../../components/common/Pagination.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import RichTextEditor from '../../components/common/RichTextEditor';
import {useCurrency} from "../../context/CurrencyContext.jsx";

const AdminProducts = () => {
    const { t } = useTranslation();
    const { format } = useCurrency();
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
    const [removeBgAdditional, setRemoveBgAdditional] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const [brandFilter, setBrandFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [allStores, setAllStores] = useState([]);
    const [productStores, setProductStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        sku: '',
        imageUrl: '',
        videoUrl: '',
        categoryId: '',
        discountPercentage: '',
        material: '',
    });
    const COLOR_PALETTE = [
        { name: 'White', hex: '#FFFFFF', key: 'white' },
        { name: 'Black', hex: '#000000', key: 'black' },
        { name: 'Gray', hex: '#808080', key: 'gray' },
        { name: 'Silver', hex: '#C0C0C0', key: 'silver' },
        { name: 'Red', hex: '#FF0000', key: 'red' },
        { name: 'Blue', hex: '#0000FF', key: 'blue' },
        { name: 'Navy', hex: '#000080', key: 'navy' },
        { name: 'Green', hex: '#008000', key: 'green' },
        { name: 'Yellow', hex: '#FFFF00', key: 'yellow' },
        { name: 'Orange', hex: '#FF8C00', key: 'orange' },
        { name: 'Purple', hex: '#800080', key: 'purple' },
        { name: 'Pink', hex: '#FFC0CB', key: 'pink' },
        { name: 'Gold', hex: '#FFD700', key: 'gold' },
        { name: 'Brown', hex: '#8B4513', key: 'brown' },
        { name: 'Beige', hex: '#F5F5DC', key: 'beige' },
        { name: 'Midnight Blue', hex: '#191970', key: 'midnightBlue' },
        { name: 'Space Gray', hex: '#4A4A4A', key: 'spaceGray' },
        { name: 'Rose Gold', hex: '#B76E79', key: 'roseGold' },
    ];

    const translateColorName = (name) => {
        if (name === 'No Color') return t('product.noColor');
        if (name === 'Multi-Color') return t('product.multiColor');
        const c = COLOR_PALETTE.find(p => p.name === name);
        return c ? t(`product.colors.${c.key}`) : name;
    };

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
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, categoryFilter, activeFilter, brandFilter, colorFilter]);

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data.content || response.data);
        } catch (e) {
            console.log(e.response?.data?.message || t('messages.failedToLoadCategories'));
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

    useEffect(() => {
        getActiveStores().then(r => setAllStores(r.data)).catch(() => {});
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
                toast.success(t('messages.productUpdated'));
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

                toast.success(t('messages.productCreated'));
            }

            setPendingImages([]);
            resetForm();
            fetchProducts();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToSave'));
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
            colorHex: product.colorHex || '',
            brand: product.brand || '',
            discountPercentage: product.discountPercentage || '',
            material: product.material || '',
        });
        setShowForm(true);

        getAllStoresForProduct(product.id)
            .then(r => setProductStores(r.data))
            .catch(() => setProductStores([]));

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleToggle = async (id) => {
        try {
            await activateDeactivateProduct(id);
            fetchProducts();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToToggleProduct'))
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
            colorHex: '',
            brand: '',
            categoryId: '',
            discountPercentage: '',
            material: '',
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
                toast.warning(t('messages.imageUploadBgFailed'));
            } else {
                toast.success(removeBg ? t('messages.imageUploadedBgRemoved') : t('messages.mainImageUploaded'));
            }
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUploadImage'));
        }
    };

    const handleAddImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        try {
            const uploadResponse = await uploadImage(file, removeBgAdditional);
            const url = uploadResponse.data.url;

            if (editingProduct) {
                await addProductImage(editingProduct.id, {
                    imageUrl: url,
                    displayOrder: editingProduct.images?.length || 0,
                    isPrimary: false
                });
                toast.success(t('messages.imageAdded'));
                const updated = await getProductById(editingProduct.id);
                setEditingProduct(updated.data);
                fetchProducts();
            } else {
                setPendingImages(prev => [...prev, url]);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToAddImage'));
        }
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await deleteProductImage(imageId);
            toast.success(t('messages.imageDeleted'));
            setEditingProduct(prev => ({
                ...prev,
                images: prev.images.filter(img => img.id !== imageId)
            }));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToDeleteImage'));
        }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        try {
            const response = await uploadVideo(file);
            setFormData(prev => ({ ...prev, videoUrl: response.data.url }));
            toast.success(t('messages.videoUploaded'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUploadVideo'));
        }
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <AdminPageHeader
                title={t('admin.products')}
                subtitle={t('admin.manageProducts')}
                buttonLabel={showForm ? t('admin.cancel') : t('admin.newProduct')}
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
                    searchPlaceholder={t('admin.searchProducts')}
                />
            )}

            <div className="flex items-center justify-between mb-6 gap-2 md:gap-4">
                <div className="flex w-1/3">
                    {!showForm && availableColors.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap items-center">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-2">{t('product.color')}:</span>
                            {availableColors.map(color => {
                                const isNoColor = color.colorName === 'No Color';
                                const isMultiColor = color.colorName === 'Multi-Color';
                                const isSelected = colorFilter === color.colorName;
                                const lightColors = ['#FFFFFF', '#FFFF00', '#FFD700', '#FFC0CB', '#F5F5DC', '#C0C0C0'];
                                const checkStroke = isNoColor || lightColors.includes(color.colorHex) ? 'black' : 'white';
                                const buttonStyle = isMultiColor
                                    ? { background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }
                                    : isNoColor
                                    ? { backgroundColor: 'white' }
                                    : { backgroundColor: color.colorHex };

                                return (
                                    <button
                                        key={color.colorName}
                                        onClick={() => { setColorFilter(prev => prev === color.colorName ? '' : color.colorName); setPage(0); }}
                                        className={`w-6 h-6 rounded-full transition-colors relative overflow-hidden border ${isSelected ? 'border-black border-2' : 'border-gray-300 hover:border-gray-500'}`}
                                        style={buttonStyle}
                                        title={translateColorName(color.colorName)}
                                    >
                                        {isNoColor && (
                                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                                                <line x1="5" y1="5" x2="19" y2="19" stroke="#ef4444" strokeWidth="2.5"/>
                                            </svg>
                                        )}
                                        {isSelected && (
                                            <span className="absolute inset-0 flex items-center justify-center">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={checkStroke} strokeWidth="4">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex w-10/12">
                    {!showForm && availableBrands.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap items-center">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-2">{t('product.brand')}:</span>
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
                        {editingProduct ? t('admin.edit') : t('admin.newProduct')}
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
                                placeholder="Product name"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.sku')}</label>
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
                            <label className={labelClass}>{t('product.price')}</label>
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
                            <label className={labelClass}>{t('cart.discount')}</label>
                            <input
                                type="number"
                                name="discountPercentage"
                                value={formData.discountPercentage || ''}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="1"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.stockQuantity')}</label>
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
                            <label className={labelClass}>{t('admin.category')}</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">{t('admin.noCategory')}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>{t('product.brand')}</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Apple, Samsung..."
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Material</label>
                            <input
                                type="text"
                                name="material"
                                value={formData.material || ''}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Silicone, Leather, Plastic..."
                            />
                        </div>

                        {/* Color */}
                        <div className="md:col-span-2 flex justify-center">
                            <label className={labelClass}>{t('product.color')}</label>
                        </div>
                        <div className="md:col-span-2 flex justify-center">
                            <div className="flex flex-wrap gap-3 justify-center">
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
                                        title={t(`product.colors.${color.key}`)}
                                    >
                                        {formData.colorName === color.name && (
                                            <span className="flex items-center justify-center h-full">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
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

                                {/* Separator */}
                                <div className="w-px bg-gray-200 self-stretch mx-1" />

                                {/* No Color */}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, colorName: 'No Color', colorHex: '' }))}
                                    className={`w-10 h-10 rounded-full border-2 transition-colors relative overflow-hidden bg-white ${
                                        formData.colorName === 'No Color'
                                            ? 'border-black'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                    title={t('product.noColor')}
                                >
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                                        <line x1="5" y1="5" x2="19" y2="19" stroke="#ef4444" strokeWidth="2.5"/>
                                    </svg>
                                    {formData.colorName === 'No Color' && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </span>
                                    )}
                                </button>

                                {/* Multi-Color */}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, colorName: 'Multi-Color', colorHex: 'multicolor' }))}
                                    className={`w-10 h-10 rounded-full border-2 transition-colors relative overflow-hidden ${
                                        formData.colorName === 'Multi-Color'
                                            ? 'border-black'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                    style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
                                    title={t('product.multiColor')}
                                >
                                    {formData.colorName === 'Multi-Color' && (
                                        <span className="flex items-center justify-center h-full">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Store availability — only when editing */}
                        {editingProduct && (
                            <div className="md:col-span-2">
                                <label className={labelClass}>{t('admin.storeAvailability')}</label>
                                <p className="text-xs text-gray-400 mb-3">
                                    {t('admin.selectStore')}
                                </p>

                                {/* Linked stores */}
                                <div className="space-y-2 mb-3">
                                    {productStores.map(ps => (
                                        <div key={ps.id} className="flex items-center justify-between border border-gray-200 px-3 py-2">
                                            <div>
                                                <p className="text-xs font-semibold text-black">{ps.storeName}</p>
                                                <p className="text-xs text-gray-400">{ps.storeCity} — {ps.storeStreet}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await toggleProductStoreStock(ps.id);
                                                            const updated = await getAllStoresForProduct(editingProduct.id);
                                                            setProductStores(updated.data);
                                                        } catch (e) {
                                                            toast.error(e.response?.data?.message || t('messages.failedToToggleStock'));
                                                        }
                                                    }}
                                                    className={`text-xs font-semibold uppercase px-2 py-0.5 ${
                                                        ps.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {ps.inStock ? t('product.inStock') : t('product.soldOut')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await removeProductFromStore(editingProduct.id, ps.storeLocationId);
                                                            setProductStores(prev => prev.filter(s => s.id !== ps.id));
                                                            toast.success(t('messages.storeRemoved'));
                                                        } catch (e) {
                                                            toast.error(e.response?.data?.message || t('messages.failedToRemoveStore'));
                                                        }
                                                    }}
                                                    className="text-xs text-red-400 hover:text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add store */}
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <select
                                            value={selectedStoreId}
                                            onChange={(e) => setSelectedStoreId(e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">{t('admin.selectStorePlaceholder')}</option>
                                            {allStores
                                                .filter(s => !productStores.some(ps => ps.storeLocationId === s.id))
                                                .map(store => (
                                                    <option key={store.id} value={store.id}>
                                                        {store.name} — {store.city}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!selectedStoreId) return;
                                            try {
                                                await addProductToStore(editingProduct.id, {
                                                    storeLocationId: parseInt(selectedStoreId),
                                                    inStock: true
                                                });
                                                const updated = await getAllStoresForProduct(editingProduct.id);
                                                setProductStores(updated.data);
                                                setSelectedStoreId('');
                                                toast.success(t('messages.storeAdded'));
                                            } catch (error) {
                                                toast.error(error.response?.data?.message || t('messages.failedToAddStore'));
                                            }
                                        }}
                                        className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2.5 hover:bg-gray-800 transition-colors"
                                    >
                                        {t('store.addStore')}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2 flex justify-center">
                            {formData.colorName && (
                                <div className="flex items-center gap-3">
                                    {formData.colorName === 'Multi-Color' ? (
                                        <div
                                            className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                                            style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
                                        />
                                    ) : formData.colorName === 'No Color' ? (
                                        <div className="w-8 h-8 rounded-full border border-gray-300 bg-white relative overflow-hidden flex-shrink-0">
                                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                                                <line x1="5" y1="5" x2="19" y2="19" stroke="#ef4444" strokeWidth="2.5"/>
                                            </svg>
                                        </div>
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                                            style={{ backgroundColor: formData.colorHex }}
                                        />
                                    )}
                                    <span className="text-sm text-black font-medium">{translateColorName(formData.colorName)}</span>
                                    {formData.colorHex && formData.colorName !== 'Multi-Color' && (
                                        <span className="text-xs text-gray-400">{formData.colorHex}</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, colorName: '', colorHex: '' }))}
                                        className="text-xs text-red-400 hover:text-red-600 underline ml-2"
                                    >
                                        {t('common.clear')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>{t('admin.mainImage')}</label>
                            <div className="flex items-center gap-3 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={removeBg}
                                        onChange={(e) => setRemoveBg(e.target.checked)}
                                        className="w-3.5 h-3.5"
                                    />
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        {t('admin.removeBackground')}
                                    </span>
                                </label>
                            </div>
                            <label className="cursor-pointer block">
                                <div className="border border-gray-300 text-center py-2.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                                    {t('admin.uploadMainImage')}
                                </div>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
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
                            <label className={labelClass}>{t('admin.additionalImages')}</label>
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

                            <div className="flex items-center gap-3 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={removeBgAdditional}
                                        onChange={(e) => setRemoveBgAdditional(e.target.checked)}
                                        className="w-3.5 h-3.5"
                                    />
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        {t('admin.removeBackground')}
                                    </span>
                                </label>
                            </div>

                            <label className="cursor-pointer block">
                                <div className="border border-gray-300 text-center py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                                    {t('admin.addImage')}
                                </div>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
                                    onChange={handleAddImage}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>{t('admin.productVideo')}</label>
                            {formData.videoUrl && (
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-xs text-green-600">✓ {t('messages.videoUploaded')}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                                        className="text-xs text-red-400 hover:text-red-600"
                                    >
                                        {t('common.remove')}
                                    </button>
                                </div>
                            )}
                            <label className="cursor-pointer block">
                                <div className="border border-gray-300 text-center py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                                    {t('admin.uploadVideo')}
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
                            <label className={labelClass}>{t('admin.description')}</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                placeholder="Product description..."
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {editingProduct ? t('common.update') : t('common.create')}
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
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">{t('admin.image')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">{t('product.product')}</th>
                            <th className="hidden md:table-cell text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">{t('admin.sku')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">{t('product.price')}</th>
                            <th className="hidden md:table-cell text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">{t('product.stock')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">{t('order.status')}</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3">{t('admin.actions')}</th>
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
                                    <p className="text-xs text-gray-400">{product.categoryName || t('admin.noCategory')}</p>
                                </td>
                                <td className="hidden md:table-cell px-3 py-3 text-xs text-gray-500">{product.sku}</td>
                                <td className="px-3 py-3 text-xs font-semibold text-black">{format(product.price)}</td>
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
                                            {t('admin.edit')}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggle(product.id); }}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            {product.active ? t('admin.deactivate') : t('admin.activate')}
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