import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { uploadImage, uploadVideo } from '../../api/uploadApi';
import { addProductImage, deleteProductImage, getProductById } from '../../api/productApi';
import { getImageUrl } from '../../utils/imageUtils';

const ProductMediaManager = ({
                                 editingProduct,
                                 setEditingProduct,
                                 formData,
                                 setFormData,
                                 pendingImages,
                                 setPendingImages,
                                 fetchProducts,
                                 labelClass,
                             }) => {
    const { t } = useTranslation();
    const [removeBg, setRemoveBg] = useState(false);
    const [removeBgAdditional, setRemoveBgAdditional] = useState(false);

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
        } catch (err) {
            toast.error(err.response?.data?.message || t('messages.failedToUploadImage'));
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
        } catch (err) {
            toast.error(err.response?.data?.message || t('messages.failedToAddImage'));
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
        } catch (err) {
            toast.error(err.response?.data?.message || t('messages.failedToDeleteImage'));
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
        } catch (err) {
            toast.error(err.response?.data?.message || t('messages.failedToUploadVideo'));
        }
    };

    return (
        <>
            {/* Main image */}
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

            {/* Additional images */}
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

            {/* Video */}
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
        </>
    );
};

export default ProductMediaManager;