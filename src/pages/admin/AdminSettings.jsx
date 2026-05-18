import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getSettings, updateSettings } from '../../api/settingsApi';
import {uploadImage} from "../../api/uploadApi.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

const AdminSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [removeBg, setRemoveBg] = useState(false);

    const sections = [
        {
            title: 'General',
            keys: ['store_name', 'store_logo_url', 'store_tagline']
        },
        {
            title: 'Location',
            keys: ['footer_address', 'footer_city', 'footer_map_address']
        },
        {
            title: 'Hours',
            keys: ['footer_hours_weekday', 'footer_hours_saturday', 'footer_hours_sunday']
        },
        {
            title: 'Contact',
            keys: ['footer_email', 'footer_phone']
        }
    ];

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getSettings();
            setSettings(response.data);
        } catch (e) {
            toast.error('Failed to load settings, error: ' + e.data.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleEdit = (settings) => {
        setEditing(settings.id);
        setEditValue(settings.value || '');
    };

    const handleSave = async (id) => {
        try {
            await updateSettings(id, editValue);
            toast.success('Setting updated');
            setEditing(null);
            fetchSettings();
            window.dispatchEvent(new Event('settings-updated'));
        } catch (e) {
            toast.error('Failed to update setting, error: ' + e.message);
        }
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:border-black transition-colors";

    {loading && <LoadingSpinner />}
    {loading && <LoadingSpinner height="h-32" />}

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    Store Settings
                </h1>
                <p className="text-sm text-gray-500">Manage store information and appearance</p>
            </div>

            <div className="space-y-8">
                {sections.map(section => (
                    <div key={section.title}>
                        <h2 className="text-xs font-black uppercase tracking-wide text-black mb-4 pb-2 border-b border-gray-200">
                            {section.title}
                        </h2>
                        <div className="space-y-4">
                            {section.keys.map(key => {
                                const setting = settings.find(s => s.key === key);
                                if (!setting) return null;

                                return (
                                    <div key={setting.id} className="flex items-center gap-4">
                                        <div className="w-48 flex-shrink-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {setting.label}
                                            </p>
                                        </div>

                                    {setting.key === 'store_logo_url' ? (
                                            <div className="flex-1 flex items-center gap-4">
                                                {setting.value && (
                                                    <img
                                                        src={setting.value.startsWith('http')
                                                            ? setting.value
                                                            : `${import.meta.env.VITE_API_URL}${setting.value}`}
                                                        alt="Logo"
                                                        className="h-8 object-contain"
                                                    />
                                                )}
                                                <div className="flex flex-col gap-2">
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
                                                    <label className="cursor-pointer">
                                                        <div className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50 transition-colors">
                                                            {setting.value ? 'Change Logo' : 'Upload Logo'}
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;
                                                                e.target.value = '';
                                                                try {
                                                                    const response = await uploadImage(file, removeBg);
                                                                    await updateSettings(setting.id, response.data.url);
                                                                    toast.success('Logo updated');
                                                                    fetchSettings();
                                                                    window.dispatchEvent(new Event('settings-updated'));
                                                                } catch (e) {
                                                                    toast.error('Failed to upload logo, error: ' + e.message);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                {setting.value && (
                                                    <button
                                                        onClick={async () => {
                                                            await updateSettings(setting.id, '');
                                                            toast.success('Logo removed');
                                                            fetchSettings();
                                                            window.dispatchEvent(new Event('settings-updated'));
                                                        }}
                                                        className="text-xs text-red-400 hover:text-red-600 underline"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ) : editing === setting.id ? (
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className={inputClass}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSave(setting.id)}
                                                    className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-800 transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditing(null)}
                                                    className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-between">
                                                <p className="text-sm text-black">
                                                    {setting.value ||
                                                        <span className="text-gray-400 italic">Not set</span>}
                                                </p>
                                                <button
                                                    onClick={() => handleEdit(setting)}
                                                    className="text-xs text-gray-500 hover:text-black transition-colors underline ml-4"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSettings;