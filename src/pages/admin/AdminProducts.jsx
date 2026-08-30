import {useState, useEffect, useCallback} from 'react';
import { toast } from 'react-toastify';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    activateDeactivateProduct,
    addProductImage,
    getProductFilters
} from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import { useTranslation } from 'react-i18next';
import { getAllStoresForProduct } from '../../api/storeApi';
import { getActiveStores } from '../../api/storeApi';
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import RichTextEditor from '../../components/common/RichTextEditor';
import { getColorVariants } from '../../api/productApi';
import ColorPicker from "../../components/admin/ColorPicker.jsx";
import ColorVariantManager from "../../components/admin/ColorVariantManager.jsx";
import StoreAvailabilityManager from "../../components/admin/StoreAvailabilityManager.jsx";
import ProductMediaManager from "../../components/admin/ProductMediaManager.jsx";
import ProductsTable from "../../components/admin/ProductsTable.jsx";
import ProductFilterBar from "../../components/admin/ProductFilterBar.jsx";
import CategoryFilterBar from "../../components/admin/CategoryFilterBar.jsx";
import { inputError, applyServerErrors, focusFirstError } from '../../utils/validationUtils';
import { normalizeWhitespace } from '../../utils/text.js';

const AdminProducts = () => {
    const { t } = useTranslation();
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
    const [activeFilter, setActiveFilter] = useState(null);
    const [brandFilter, setBrandFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [allStores, setAllStores] = useState([]);
    const [productStores, setProductStores] = useState([]);
    const [colorVariants, setColorVariants] = useState([]);
    const ALL_SIZES = ['S', 'M', 'L', 'XL'];
    const defaultVariants = () => ALL_SIZES.map(size => ({ size, stockQuantity: 0, sku: '' }));

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        sku: '',
        imageUrl: '',
        videoUrl: '',
        categoryId: '',
        discountPercentage: '',
        material: '',
        gender: 'UNISEX',
        variants: defaultVariants(),
    });
    const [errors, setErrors] = useState({});
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
            if (genderFilter) params.gender = genderFilter;

            const response = await getProducts(params);
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, categoryFilter, activeFilter, brandFilter, colorFilter, genderFilter]);

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
    }, [fetchProducts])

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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const e = {};
        if (!formData.name?.trim()) e.name = t('validation.nameRequired');
        if (!formData.sku?.trim()) e.sku = t('validation.skuRequired');
        if (formData.price === '' || formData.price === null || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
            e.price = t('validation.priceInvalid');
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
            const payload = {
                ...formData,
                // strip &nbsp; / zero-width noise the rich-text editor emits; the
                // backend re-applies typography rules and returns the source of truth
                description: normalizeWhitespace(formData.description),
                price: parseFloat(formData.price),
                stockQuantity: 0,
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                variants: formData.variants.map(v => ({
                    size: v.size,
                    stockQuantity: parseInt(v.stockQuantity) || 0
                })),
            };

            if (editingProduct) {
                // Edit mode persists variants/stores immediately via their own endpoints,
                // so these fields are omitted — sending them (even empty) would clear relations.
                await updateProduct(editingProduct.id, payload);
                toast.success(t('messages.productUpdated'));
            } else {
                const createPayload = {
                    ...payload,
                    colorVariantIds: colorVariants.filter(v => !v.isCurrent).map(v => v.productId),
                    stores: productStores.map(ps => ({
                        storeLocationId: ps.storeLocationId,
                        inStock: ps.inStock,
                    })),
                };
                const response = await createProduct(createPayload);
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
            if (!applyServerErrors(e, t, setErrors)) {
                toast.error(e.response?.data?.message || t('messages.failedToSave'));
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            sku: product.sku,
            imageUrl: product.imageUrl || '',
            videoUrl: product.videoUrl || '',
            categoryId: product.categoryId || '',
            colorName: product.colorName || '',
            colorHex: product.colorHex || '',
            brand: product.brand || '',
            discountPercentage: product.discountPercentage || '',
            material: product.material || '',
            gender: product.gender ?? 'UNISEX',
            variants: ALL_SIZES.map(size => {
                const found = product.variants?.find(v => v.size === size);
                return { size, stockQuantity: found?.stockQuantity ?? 0 /*, sku: found?.sku ?? ''*/ };
            }),
        });
        setShowForm(true);

        getAllStoresForProduct(product.id)
            .then(r => setProductStores(r.data))
            .catch(() => setProductStores([]));

        getColorVariants(product.id)
            .then(r => setColorVariants(r.data))
            .catch(() => setColorVariants([]));

        setErrors({});
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

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            sku: '',
            imageUrl: '',
            videoUrl: '',
            colorName: '',
            colorHex: '',
            brand: '',
            categoryId: '',
            discountPercentage: '',
            material: '',
            gender: 'UNISEX',
            variants: defaultVariants(),
        });
        setEditingProduct(null);
        setPendingImages([]);
        setColorVariants([]);
        setProductStores([]);
        setShowForm(false);
        setErrors({});
    };
    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const errorInputClass = (field) => errors[field]
        ? `w-full border ${inputError} px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none transition-colors`
        : inputClass;
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
                            // start from a clean slate so no stale draft variants/stores leak in
                            resetForm();
                            setShowForm(true);
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

            {!showForm && (
                <ProductFilterBar
                    availableColors={availableColors}
                    availableBrands={availableBrands}
                    colorFilter={colorFilter}
                    setColorFilter={setColorFilter}
                    brandFilter={brandFilter}
                    setBrandFilter={setBrandFilter}
                    genderFilter={genderFilter}
                    setGenderFilter={setGenderFilter}
                    setPage={setPage}
                    translateColorName={translateColorName}
                />
            )}

            {!showForm && (
                <CategoryFilterBar
                    categories={categories}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    setPage={setPage}
                />
            )}

            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingProduct ? t('admin.edit') : t('admin.newProduct')}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} htmlFor="product-name">{t('product.name')}</label>
                            <input
                                id="product-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? 'product-name-error' : undefined}
                                className={errorInputClass('name')}
                                placeholder="Product name"
                            />
                            {errors.name && <p id="product-name-error" className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="product-sku">{t('admin.sku')}</label>
                            <input
                                id="product-sku"
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                aria-invalid={!!errors.sku}
                                aria-describedby={errors.sku ? 'product-sku-error' : undefined}
                                className={errorInputClass('sku')}
                                placeholder="PROD-001"
                            />
                            {errors.sku && <p id="product-sku-error" className="text-xs text-red-500 mt-1">{errors.sku}</p>}
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="product-price">{t('product.price')}</label>
                            <input
                                id="product-price"
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                aria-invalid={!!errors.price}
                                aria-describedby={errors.price ? 'product-price-error' : undefined}
                                className={errorInputClass('price')}
                                placeholder="0.00"
                                step="0.01"
                            />
                            {errors.price && <p id="product-price-error" className="text-xs text-red-500 mt-1">{errors.price}</p>}
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
                            <label className={labelClass}>{t('product.gender')}</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                className={inputClass}
                            >
                                <option value="MEN">{t('product.genderMen')}</option>
                                <option value="WOMEN">{t('product.genderWomen')}</option>
                                <option value="UNISEX">{t('product.genderUnisex')}</option>
                            </select>
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
                            <label className={labelClass}>{t('product.material')}</label>
                            <input
                                type="text"
                                name="material"
                                value={formData.material || ''}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Silicone, Leather, Plastic..."
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.sizesAndStock')}</label>
                            <p className="text-xs text-gray-400 mb-3">{t('admin.sizesHint')}</p>
                            <div className="space-y-2">
                                {formData.variants.map((v, idx) => (
                                    <div key={v.size} className="flex items-center gap-3">
                                        <span className="w-110 text-lg font-bold text-black shrink-0 border-b border-gray-200 self-end">{v.size}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={v.stockQuantity}
                                            onChange={(e) => {
                                                const updated = [...formData.variants];
                                                updated[idx] = { ...updated[idx], stockQuantity: e.target.value };
                                                setFormData({ ...formData, variants: updated });
                                            }}
                                            className={inputClass + " flex-1 justify-items-center"}
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ColorPicker
                            palette={COLOR_PALETTE}
                            colorName={formData.colorName}
                            colorHex={formData.colorHex}
                            onSelect={(name, hex) => setFormData(prev =>
                                ({ ...prev, colorName: name, colorHex: hex }))}
                            translateColorName={translateColorName}
                            t={t}
                        />

                        <ColorVariantManager
                            productId={editingProduct?.id}
                            colorVariants={colorVariants}
                            setColorVariants={setColorVariants}
                            inputClass={inputClass}
                        />

                        <StoreAvailabilityManager
                            productId={editingProduct?.id}
                            allStores={allStores}
                            productStores={productStores}
                            setProductStores={setProductStores}
                            inputClass={inputClass}
                        />

                        <ProductMediaManager
                            editingProduct={editingProduct}
                            setEditingProduct={setEditingProduct}
                            formData={formData}
                            setFormData={setFormData}
                            pendingImages={pendingImages}
                            setPendingImages={setPendingImages}
                            fetchProducts={fetchProducts}
                            labelClass={labelClass}
                        />

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

            {loading && <LoadingSpinner />}
            {
                loading && <LoadingSpinner height="h-32" />
            }
            {(
                <ProductsTable
                    products={products}
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default AdminProducts;