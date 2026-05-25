import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getSettings, updateSettings } from '../../api/settingsApi';
import {uploadImage} from "../../api/uploadApi.js";
import { getAllFilters, updateFilter, createFilter, deleteFilter } from '../../api/filterApi';
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

const AdminSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [removeBg, setRemoveBg] = useState(false);
    const [filters, setFilters] = useState([]);
    const [newFilterName, setNewFilterName] = useState('');
    const [newFilterDisplay, setNewFilterDisplay] = useState('');
    const [showNewFilter, setShowNewFilter] = useState(false);

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
        },
        {
            title: 'Payment',
            keys: ['payment_card_enabled', 'payment_cod_enabled']
        }
    ];

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getSettings();
            setSettings(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load settings');
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
            toast.error(e.response?.data?.message || 'Failed to update settings');
        }
    };

    const fetchFilters = useCallback(async () => {
        try {
            const response = await getAllFilters();
            setFilters(response.data);
        } catch (e) {
            console.log(e.response?.data?.message || 'Failed to load filters');
        }
    }, []);

    useEffect(() => {
        fetchFilters();
    }, [fetchFilters]);

    const handleFilterToggle = async (filter) => {
        try {
            await updateFilter(filter.id, { visible: !filter.visible });
            toast.success(`${filter.displayName} filter ${filter.visible ? 'hidden' : 'shown'}`);
            fetchFilters();
            window.dispatchEvent(new Event('settings-updated'));
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update filter');
        }
    };

    const handleFilterReorder = async (filter, newOrder) => {
        try {
            await updateFilter(filter.id, { displayOrder: newOrder });
            fetchFilters();
            window.dispatchEvent(new Event('settings-updated'));
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to reorder filter');
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

                                        {/* Boolean toggle for payment settings */}
                                        {(setting.key === 'payment_card_enabled' || setting.key === 'payment_cod_enabled') ? (
                                            <div className="flex-1 flex items-center gap-3">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const newValue = setting.value === 'true' ? 'false' : 'true';
                                                            await updateSettings(setting.id, newValue);
                                                            toast.success(`${setting.label} ${newValue === 'true' ? 'enabled' : 'disabled'}`);
                                                            fetchSettings();
                                                            window.dispatchEvent(new Event('settings-updated'));
                                                        } catch (e) {
                                                            toast.error(e.response?.data?.message || 'Failed to update setting');
                                                        }
                                                    }}
                                                    className={`w-10 h-5 rounded-full transition-colors relative ${
                                                        setting.value === 'true' ? 'bg-black' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                                        setting.value === 'true' ? 'left-5' : 'left-0.5'
                                                    }`} />
                                                </button>
                                                <span className="text-sm text-gray-500">
                                                    {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                        ) : setting.key === 'store_logo_url' ? (
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
                {/* Filter Configuration */}
                <div>
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-4 pb-2 border-b border-gray-200">
                        Product Filters
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">
                        Toggle which filters are visible on the Products page
                    </p>
                    <div className="space-y-3">
                        {filters.map(filter => (
                            <div key={filter.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    {/* Toggle */}
                                    <button
                                        onClick={() => handleFilterToggle(filter)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${
                                            filter.visible ? 'bg-black' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                            filter.visible ? 'left-5' : 'left-0.5'
                                        }`} />
                                    </button>
                                    <div>
                                        <p className="text-sm font-medium text-black">{filter.displayName}</p>
                                        <p className="text-xs text-gray-400">{filter.filterType} filter</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">Order:</span>
                                    <input
                                        type="number"
                                        value={filter.displayOrder}
                                        onChange={(e) => handleFilterReorder(filter, parseInt(e.target.value))}
                                        className="w-12 border border-gray-300 px-2 py-1 text-xs text-center focus:outline-none focus:border-black"
                                    />
                                    {/* Delete button — only for custom filters */}
                                    {filter.fieldName.startsWith('attr_') && (
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm(`Delete ${filter.displayName} filter?`)) return;
                                                try {
                                                    await deleteFilter(filter.id);
                                                    toast.success('Filter deleted');
                                                    fetchFilters();
                                                    window.dispatchEvent(new Event('settings-updated'));
                                                } catch (e) {
                                                    toast.error(e.response?.data?.message || 'Failed to delete filter');
                                                }
                                            }}
                                            className="text-xs text-red-400 hover:text-red-600 underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Add new filter */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                    {showNewFilter ? (
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Field Name (no spaces)</label>
                                    <input
                                        type="text"
                                        value={newFilterName}
                                        onChange={(e) => setNewFilterName(e.target.value.replace(/\s/g, ''))}
                                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                                        placeholder="e.g. material"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={newFilterDisplay}
                                        onChange={(e) => setNewFilterDisplay(e.target.value)}
                                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                                        placeholder="e.g. Material"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        if (!newFilterName || !newFilterDisplay) {
                                            toast.error('Fill in both fields');
                                            return;
                                        }
                                        try {
                                            await createFilter({
                                                fieldName: `attr_${newFilterName}`,
                                                displayName: newFilterDisplay,
                                                filterType: 'select'
                                            });
                                            toast.success('Filter created');
                                            setNewFilterName('');
                                            setNewFilterDisplay('');
                                            setShowNewFilter(false);
                                            fetchFilters();
                                            window.dispatchEvent(new Event('settings-updated'));
                                        } catch (e) {
                                            toast.error(e.response?.data?.message || 'Failed to create filter');
                                        }
                                    }}
                                    className="bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-800"
                                >
                                    Add Filter
                                </button>
                                <button
                                    onClick={() => setShowNewFilter(false)}
                                    className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowNewFilter(true)}
                            className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black"
                        >
                            + Add Custom Filter
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;