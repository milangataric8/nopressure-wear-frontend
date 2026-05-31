import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllPopups, createPopup, updatePopup, togglePopup, deletePopup } from '../../api/popupApi';
import { uploadImage, uploadVideo } from '../../api/uploadApi';
import { getImageUrl } from '../../utils/imageUtils';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminPopups = () => {
    const [popups, setPopups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPopup, setEditingPopup] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        content: '',
        mediaUrl: '',
        mediaType: 'IMAGE',
        buttonText: '',
        buttonLink: '',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        showOnce: false,
    });

    const fetchPopups = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllPopups();
            setPopups(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load popups');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPopups();
    }, [fetchPopups]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
            toast.error(e.response?.data?.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPopup) {
                await updatePopup(editingPopup.id, formData);
                toast.success('Popup updated');
            } else {
                await createPopup(formData);
                toast.success('Popup created');
            }
            resetForm();
            fetchPopups();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save popup');
        }
    };

    const handleEdit = (popup) => {
        setEditingPopup(popup);
        setFormData({
            title: popup.title || '',
            subtitle: popup.subtitle || '',
            content: popup.content || '',
            mediaUrl: popup.mediaUrl || '',
            mediaType: popup.mediaType || 'IMAGE',
            buttonText: popup.buttonText || '',
            buttonLink: popup.buttonLink || '',
            backgroundColor: popup.backgroundColor || '#FFFFFF',
            textColor: popup.textColor || '#000000',
            showOnce: popup.showOnce || false,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this popup?')) return;
        try {
            await deletePopup(id);
            toast.success('Popup deleted');
            fetchPopups();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete popup');
        }
    };

    const handleToggle = async (id) => {
        try {
            await togglePopup(id);
            fetchPopups();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to toggle popup');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            content: '',
            mediaUrl: '',
            mediaType: 'IMAGE',
            buttonText: '',
            buttonLink: '',
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
            showOnce: false,
        });
        setEditingPopup(null);
        setShowForm(false);
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <AdminPageHeader
                title="Popups"
                subtitle="Manage homepage popup notifications"
                buttonLabel={showForm ? 'Cancel' : '+ New Popup'}
                onButtonClick={() => showForm ? resetForm() : setShowForm(true)}
            />

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {editingPopup ? 'Edit Popup' : 'New Popup'}
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
                                placeholder="Summer Sale!"
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
                                placeholder="Limited time offer"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Content</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Get up to 50% off on all products..."
                                rows={3}
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
                            {formData.mediaUrl && (
                                <div className="mt-2 h-32 overflow-hidden border border-gray-200">
                                    {formData.mediaType === 'VIDEO' ? (
                                        <video src={getImageUrl(formData.mediaUrl)} className="w-full h-full object-cover" muted controls />
                                    ) : (
                                        <img src={getImageUrl(formData.mediaUrl)} alt="Preview" className="w-full h-full object-cover" />
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

                        <div>
                            <label className={labelClass}>Background Color</label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    name="backgroundColor"
                                    value={formData.backgroundColor}
                                    onChange={handleChange}
                                    className="w-12 h-10 border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    name="backgroundColor"
                                    value={formData.backgroundColor}
                                    onChange={handleChange}
                                    className="flex-1 border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Text Color</label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    name="textColor"
                                    value={formData.textColor}
                                    onChange={handleChange}
                                    className="w-12 h-10 border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    name="textColor"
                                    value={formData.textColor}
                                    onChange={handleChange}
                                    className="flex-1 border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="showOnce"
                                    checked={formData.showOnce}
                                    onChange={handleChange}
                                    className="w-3.5 h-3.5"
                                />
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    Show only once per user
                                </span>
                            </label>
                        </div>

                        {/* Preview */}
                        <div className="md:col-span-2">
                            <label className={labelClass}>Preview</label>
                            <div
                                className="border border-gray-200 overflow-hidden"
                                style={{ backgroundColor: formData.backgroundColor }}
                            >
                                {formData.mediaUrl && formData.mediaType === 'IMAGE' && (
                                    <div className="h-32 overflow-hidden">
                                        <img src={getImageUrl(formData.mediaUrl)} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-1" style={{ color: formData.textColor }}>
                                        {formData.title || 'Title'}
                                    </h3>
                                    {formData.subtitle && (
                                        <p className="text-xs opacity-70 mb-2" style={{ color: formData.textColor }}>{formData.subtitle}</p>
                                    )}
                                    {formData.content && (
                                        <p className="text-xs opacity-80 mb-4" style={{ color: formData.textColor }}>{formData.content}</p>
                                    )}
                                    {formData.buttonText && (
                                        <span
                                            className="inline-block text-xs font-semibold uppercase tracking-wide px-6 py-2"
                                            style={{ backgroundColor: formData.textColor, color: formData.backgroundColor }}
                                        >
                                            {formData.buttonText}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {editingPopup ? 'Update Popup' : 'Create Popup'}
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

            {/* Popups list */}
            {loading ? (
                <LoadingSpinner />
            ) : popups.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">No popups yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {popups.map(popup => (
                        <div key={popup.id} className="border border-gray-200 p-4 flex gap-4 items-center">
                            {/* Preview */}
                            <div
                                className="w-32 h-20 flex-shrink-0 overflow-hidden flex items-center justify-center"
                                style={{ backgroundColor: popup.backgroundColor }}
                            >
                                {popup.mediaUrl ? (
                                    popup.mediaType === 'VIDEO' ? (
                                        <video src={getImageUrl(popup.mediaUrl)} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={getImageUrl(popup.mediaUrl)} alt={popup.title} className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <span
                                        className="text-xs font-bold uppercase"
                                        style={{ color: popup.textColor }}
                                    >
                                        {popup.title}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-sm font-semibold text-black">{popup.title}</h3>
                                    <StatusBadge active={popup.active} />
                                    {popup.showOnce && (
                                        <span className="text-xs text-gray-400 uppercase">Show once</span>
                                    )}
                                </div>
                                {popup.subtitle && (
                                    <p className="text-xs text-gray-500">{popup.subtitle}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleEdit(popup)}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleToggle(popup.id)}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    {popup.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => handleDelete(popup.id)}
                                    className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPopups;