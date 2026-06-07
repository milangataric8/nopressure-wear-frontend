import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getSettings, updateSettings } from '../../api/settingsApi';
import {uploadImage} from "../../api/uploadApi.js";
import { getAllFilters, updateFilter } from '../../api/filterApi';
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { useTranslation } from 'react-i18next';

const AdminSettings = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [removeBg, setRemoveBg] = useState(false);
    const [filters, setFilters] = useState([]);

    const sections = [
        {
            title: t('settings.general'),
            keys: ['store_name', 'store_logo_url', 'store_tagline']
        },
        {
            title: t('settings.location'),
            keys: ['footer_address', 'footer_city', 'footer_map_address']
        },
        {
            title: t('settings.hours'),
            keys: ['footer_hours_weekday', 'footer_hours_saturday', 'footer_hours_sunday']
        },
        {
            title: t('settings.contact'),
            keys: ['footer_email', 'footer_phone']
        },
        {
            title: t('settings.socialMedia'),
            keys: ['social_instagram', 'social_facebook', 'social_x', 'social_threads', 'social_tiktok', 'social_youtube']
        },
        {
            title: t('settings.payment'),
            keys: ['payment_card_enabled', 'payment_cod_enabled']
        },
        {
            title: t('settings.features'),
            keys: ['find_in_store_enabled', 'reviews_enabled', 'favorites_enabled']
        }
    ];

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getSettings();
            setSettings(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
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
            toast.success(t('messages.settingUpdated'));
            setEditing(null);
            fetchSettings();
            window.dispatchEvent(new Event('settings-updated'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const fetchFilters = useCallback(async () => {
        try {
            const response = await getAllFilters();
            setFilters(response.data);
        } catch (e) {
            console.log(e.response?.data?.message || t('messages.failedToLoadFilters'));
        }
    }, []);

    useEffect(() => {
        fetchFilters();
    }, [fetchFilters]);

    const handleFilterToggle = async (filter) => {
        try {
            await updateFilter(filter.id, { visible: !filter.visible });
            toast.success(filter.visible ? t('messages.filterHidden', { name: filter.displayName }) : t('messages.filterShown', { name: filter.displayName }));
            fetchFilters();
            window.dispatchEvent(new Event('settings-updated'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
        }
    };

    const handleFilterReorder = async (filter, newOrder) => {
        try {
            await updateFilter(filter.id, { displayOrder: newOrder });
            fetchFilters();
            window.dispatchEvent(new Event('settings-updated'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
        }
    };

    const translateFilterName = (displayName) => {
        const map = {
            'Categories': t('settings.filterCategories'),
            'Color': t('settings.filterColor'),
            'Brand': t('settings.filterBrand'),
            'Price': t('settings.filterPrice'),
        };
        return map[displayName] || displayName;
    };

    const translateFilterType = (filterType) => {
        const map = {
            select: t('settings.filterTypeSelect'),
            color: t('settings.filterTypeColor'),
            range: t('settings.filterTypeRange'),
        };
        return map[filterType] || filterType;
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:border-black transition-colors";

    {loading && <LoadingSpinner />}
    {loading && <LoadingSpinner height="h-32" />}

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    {t('settings.title')}
                </h1>
                <p className="text-sm text-gray-500">{t('settings.subtitle')}</p>
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
                                                {t(`settings.${setting.key}`, { defaultValue: setting.label })}
                                            </p>
                                        </div>

                                        {/* Boolean toggle for payment settings */}
                                        {['payment_card_enabled', 'payment_cod_enabled', 'find_in_store_enabled', 'reviews_enabled', 'favorites_enabled'].includes(setting.key) ? (
                                            <div className="flex-1 flex items-center gap-3">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const newValue = setting.value === 'true' ? 'false' : 'true';
                                                            await updateSettings(setting.id, newValue);
                                                            toast.success(newValue === 'true' ? t('messages.settingEnabled', { name: setting.label }) : t('messages.settingDisabled', { name: setting.label }));
                                                            fetchSettings();
                                                            window.dispatchEvent(new Event('settings-updated'));
                                                        } catch (e) {
                                                            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
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
                                                    {setting.value === 'true' ? t('settings.enabled') : t('settings.disabled')}
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
                                                                {t('admin.removeBackground')}
                                                            </span>
                                                        </label>
                                                        <label className="cursor-pointer">
                                                            <div className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50 transition-colors">
                                                                {setting.value ? t('settings.changeLogo') : t('settings.uploadLogo')}
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
                                                                        toast.success(t('messages.logoUpdated'));
                                                                        fetchSettings();
                                                                        window.dispatchEvent(new Event('settings-updated'));
                                                                    } catch (e) {
                                                                        toast.error(e.response?.data?.message || t('messages.failedToUploadLogo'));
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                    {setting.value && (
                                                        <button
                                                            onClick={async () => {
                                                                await updateSettings(setting.id, '');
                                                                toast.success(t('messages.logoRemoved'));
                                                                fetchSettings();
                                                                window.dispatchEvent(new Event('settings-updated'));
                                                            }}
                                                            className="text-xs text-red-400 hover:text-red-600 underline"
                                                        >
                                                            {t('common.remove')}
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
                                                        {t('common.save')}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditing(null)}
                                                        className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50 transition-colors"
                                                    >
                                                        {t('common.cancel')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-between">
                                                    <p className="text-sm text-black">
                                                        {setting.value ||
                                                            <span className="text-gray-400 italic">{t('settings.notSet')}</span>}
                                                    </p>
                                                    <button
                                                        onClick={() => handleEdit(setting)}
                                                        className="text-xs text-gray-500 hover:text-black transition-colors underline ml-4"
                                                    >
                                                        {t('common.edit')}
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
                        {t('settings.productFilters')}
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">
                        {t('settings.filterToggleDesc')}
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
                                        <p className="text-sm font-medium text-black">{translateFilterName(filter.displayName)}</p>
                                        <p className="text-xs text-gray-400">{translateFilterType(filter.filterType)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">{t('settings.order')}:</span>
                                    <input
                                        type="number"
                                        value={filter.displayOrder}
                                        onChange={(e) => handleFilterReorder(filter, parseInt(e.target.value))}
                                        className="w-12 border border-gray-300 px-2 py-1 text-xs text-center focus:outline-none focus:border-black"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;