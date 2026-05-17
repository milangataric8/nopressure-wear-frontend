import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllBanners, createBanner, updateBanner, toggleBanner, deleteBanner } from '../../api/bannerApi';
import { uploadImage, uploadVideo } from '../../api/uploadApi';
import { getImageUrl } from '../../utils/imageUtils';

const AdminBanners = () => {
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
            toast.error('Failed to load banners, error: ' + e.message);
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
            toast.success('File uploaded');
        } catch (e) {
            toast.error('Failed to upload file, error: ' + e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBanner) {
                await updateBanner(editingBanner.id, formData);
                toast.success('Banner updated');
            } else {
                await createBanner(formData);
                toast.success('Banner created');
            }
            resetForm();
            fetchBanners();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save banner');
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
        if (!window.confirm('Delete this banner?')) return;
        try {
            await deleteBanner(id);
            toast.success('Banner deleted');
            fetchBanners();
        } catch (e) {
            toast.error('Failed to delete banner, error: ' + e.message);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleBanner(id);
            fetchBanners();
        } catch (e) {
            toast.error('Failed to toggle banner, error: ' + e.message);
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
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        Banners
                    </h1>
                    <p className="text-sm text-gray-500">Manage hero banners on the home page</p>
                </div>
                <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Banner'}
                </button>
            </div>

            {!showForm && (
                <div className="flex items-center justify-between mb-6 gap-4">
                    {/* Active/Inactive filter — left 50% */}
                    <div className="flex w-1/2">
                        <button
                            onClick={() => { setActiveFilter(prev => prev === true ? null : true); setPage(0); }}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                                activeFilter === true
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-500 border-gray-300 hover:border-green-600 hover:text-green-600'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => { setActiveFilter(activeFilter === false ? null : false); setPage(0); }}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide border-t border-b border-r transition-colors ${
                                activeFilter === false
                                    ? 'bg-red-500 text-white border-red-500'
                                    : 'bg-white text-gray-500 border-gray-300 hover:border-red-500 hover:text-red-500'
                            }`}
                        >
                            Inactive
                        </button>
                    </div>

                    {/* Search — right 50% */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(0); }}
                        className="flex w-1/2"
                    >
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search products by title..."
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
                                ×
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingBanner ? 'Edit Banner' : 'New Banner'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Title</label>
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
                            <label className={labelClass}>Subtitle</label>
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
                            <label className={labelClass}>Media Type</label>
                            <select
                                name="mediaType"
                                value={formData.mediaType}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="IMAGE">Image</option>
                                <option value="VIDEO">Video</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Display Order</label>
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
                                Upload {formData.mediaType === 'VIDEO' ? 'Video' : 'Image'}
                            </label>
                            <label className="cursor-pointer block">
                                <div className="border border-gray-300 text-center py-2.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gray-50 transition-colors">
                                    {uploading ? 'Uploading...' : `Upload ${formData.mediaType === 'VIDEO' ? 'Video' : 'Image'}`}
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
                            <label className={labelClass}>Button Text</label>
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
                            <label className={labelClass}>Button Link</label>
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
                                {editingBanner ? 'Update Banner' : 'Create Banner'}
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

            {/* Banners list */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
            ) : banners.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">No banners yet</p>
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
                                        <span className="text-gray-400 text-xs">No media</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-sm font-semibold text-black">{banner.title}</h3>
                                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 ${
                                        banner.active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {banner.active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-400 uppercase">{banner.mediaType}</span>
                                </div>
                                {banner.subtitle && (
                                    <p className="text-xs text-gray-500 mb-1">{banner.subtitle}</p>
                                )}
                                <p className="text-xs text-gray-400">Order: {banner.displayOrder}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleEdit(banner)}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleToggle(banner.id)}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    {banner.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
    );
};

export default AdminBanners;