import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllBanners, createBanner, updateBanner, toggleBanner, deleteBanner } from '../../api/bannerApi';
import { uploadImage, uploadVideo } from '../../api/uploadApi';
import { getImageUrl } from '../../utils/imageUtils';
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useTranslation } from 'react-i18next';

const AdminBanners = () => {
    const { t } = useTranslation();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        mediaUrl: '',
        mediaType: 'IMAGE',
        buttonText: '',
        buttonLink: '',
        displayOrder: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeFilter, setActiveFilter] = useState(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };

            if (searchQuery) params.search = searchQuery;
            if (activeFilter !== null) params.active = activeFilter;

            const response = await getAllBanners(params);

            setBanners(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchBanners();
    },[page, searchQuery, activeFilter]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        setUploading(true);
        try {
            let response;
            if (formData.mediaType === 'VIDEO') {
                response = await uploadVideo(file);
            } else {
                response = await uploadImage(file);
            }
            setFormData(prev => ({ ...prev, mediaUrl: response.data.url }));
            toast.success(t('messages.fileUploaded'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUploadFile'));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBanner) {
                await updateBanner(editingBanner.id, formData);
                toast.success(t('messages.bannerUpdated'));
            } else {
                await createBanner(formData);
                toast.success(t('messages.bannerCreated'));
            }
            resetForm();
            fetchBanners();
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            mediaUrl: banner.mediaUrl || '',
            mediaType: banner.mediaType,
            buttonText: banner.buttonText || '',
            buttonLink: banner.buttonLink || '',
            displayOrder: banner.displayOrder,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('messages.confirmDelete'))) return;
        try {
            await deleteBanner(id);
            toast.success(t('messages.bannerDeleted'));
            fetchBanners();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleBanner(id);
            fetchBanners();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            mediaUrl: '',
            mediaType: 'IMAGE',
            buttonText: '',
            buttonLink: '',
            displayOrder: 0,
        });
        setEditingBanner(null);
        setShowForm(false);
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (

        <div className="max-w-7xl mx-auto px-6 py-10">
            <AdminPageHeader
                title={t('admin.banners')}
                subtitle={t('admin.manageBanners')}
                buttonLabel={showForm ? t('admin.cancel') : t('admin.newBanner')}
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
                    searchPlaceholder={t('admin.searchBanners')}
                />
            )}

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingBanner ? t('admin.edit') : t('admin.newBanner')}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('admin.title')}</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Summer Collection"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.subtitle')}</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Discover the latest products"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.mediaType')}</label>
                            <select
                                name="mediaType"
                                value={formData.mediaType}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="IMAGE">{t('admin.mediaImage')}</option>
                                <option value="VIDEO">{t('admin.mediaVideo')}</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.displayOrder')}</label>
                            <input
                                type="number"
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>
                                {t('common.upload')} {formData.mediaType === 'VIDEO' ? t('admin.mediaVideo') : t('admin.mediaImage')}
                            </label>
                            <label className="cursor-pointer block">
                                <div className="border border-gray-300 text-center py-2.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                                    {uploading ? t('common.uploading') : `${t('common.upload')} ${formData.mediaType === 'VIDEO' ? t('admin.mediaVideo') : t('admin.mediaImage')}`}
                                </div>
                                <input
                                    type="file"
                                    accept={formData.mediaType === 'VIDEO' ? 'video/*' : 'image/*'}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>

                            {/* Preview */}
                            {formData.mediaUrl && (
                                <div className="mt-3 border border-gray-200 overflow-hidden h-40">
                                    {formData.mediaType === 'VIDEO' ? (
                                        <video
                                            src={getImageUrl(formData.mediaUrl)}
                                            className="w-full h-full object-cover"
                                            muted
                                            controls
                                        />
                                    ) : (
                                        <img
                                            src={getImageUrl(formData.mediaUrl)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.buttonText')}</label>
                            <input
                                type="text"
                                name="buttonText"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Shop Now"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('admin.buttonLink')}</label>
                            <input
                                type="text"
                                name="buttonLink"
                                value={formData.buttonLink}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="/products"
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {editingBanner ? t('common.update') : t('common.create')}
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

            {/* Banners list */}
            {loading && <LoadingSpinner />}
            {
                loading && <LoadingSpinner height="h-32" />
            }
            { banners.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">{t('admin.noBanners')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {banners.map(banner => (
                        <div key={banner.id} className="border border-gray-200 p-4 flex gap-4 items-center">
                            {/* Preview */}
                            <div className="w-32 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                                {banner.mediaUrl ? (
                                    banner.mediaType === 'VIDEO' ? (
                                        <video
                                            src={getImageUrl(banner.mediaUrl)}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={getImageUrl(banner.mediaUrl)}
                                            alt={banner.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">{t('admin.noMedia')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-sm font-semibold text-black">{banner.title}</h3>

                                    <StatusBadge active={banner.active} />

                                    <span className="hidden md:table-cell text-xs text-gray-400 uppercase">{banner.mediaType}</span>
                                </div>
                                {banner.subtitle && (
                                    <p className="text-xs text-gray-500 mb-1">{banner.subtitle}</p>
                                )}
                                <p className="text-xs text-gray-400">{t('settings.order')}: {banner.displayOrder}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleEdit(banner)}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    {t('admin.edit')}
                                </button>
                                <button
                                    onClick={() => handleToggle(banner.id)}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    {banner.active ? t('admin.deactivate') : t('admin.activate')}
                                </button>
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                                >
                                    {t('admin.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
    );
};

export default AdminBanners;