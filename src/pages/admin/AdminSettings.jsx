import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getSettings, updateSettings } from '../../api/settingsApi';
import {uploadImage} from "../../api/uploadApi.js";
import { getAllFilters, updateFilter } from '../../api/filterApi';
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { useTranslation } from 'react-i18next';
import RichTextEditor from "../../components/common/RichTextEditor.jsx";

const AdminSettings = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [removeBg, setRemoveBg] = useState(false);
    const [filters, setFilters] = useState([]);
    const [openSection, setOpenSection] = useState(null);
    const [removeBgAuth, setRemoveBgAuth] = useState(false);

    const toggleSection = (key) => {
        setOpenSection(prev => prev === key ? null : key);
    };

    const sections = [
        {
            key: 'general',
            title: t('settings.general'),
            keys: ['store_name', 'store_logo_url', 'store_tagline']
        },
        {
            key: 'auth',
            title: t('settings.auth'),
            keys: ['auth_bg_type', 'auth_bg_image', 'auth_bg_color', 'auth_bg_heading', 'auth_bg_subtext']
        },
        {
            key: 'location',
            title: t('settings.location'),
            keys: ['footer_address', 'footer_city', 'footer_map_address']
        },
        {
            key: 'hours',
            title: t('settings.hours'),
            keys: ['footer_hours_weekday', 'footer_hours_saturday', 'footer_hours_sunday']
        },
        {
            key: 'contact',
            title: t('settings.contact'),
            keys: ['footer_email', 'footer_phone']
        },
        {
            key: 'social',
            title: t('settings.socialMedia'),
            keys: ['social_instagram',
                'social_facebook',
                'social_x',
                'social_threads',
                'social_tiktok',
                'social_youtube']
        },
        {
            key: 'payment',
            title: t('settings.payment'),
            keys: ['payment_card_enabled', 'payment_cod_enabled']
        },
        {
            key: 'access',
            title: t('settings.access'),
            keys: ['registration_enabled', 'login_enabled']
        },
        {
            key: 'features',
            title: t('settings.features'),
            keys: ['find_in_store_enabled',
                'reviews_enabled',
                'favorites_enabled',
                'contact_enabled',
                'add_to_cart_enabled',
                'multilanguage_enabled',
                'default_language']
        },
        {
            key: 'currency',
            title: t('settings.currency'),
            keys: ['base_currency',
                'currency_en',
                'currency_sr',
                'exchange_rate_eur',
                'exchange_rate_usd']
        },
        {
            key: 'delivery',
            title: t('settings.delivery'),
            keys: ['delivery_enabled', 'delivery_fee', 'free_shipping_threshold']
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
            'Material': t('settings.filterMaterial'),
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

    const chevron = (sectionKey) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18" height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`text-gray-400 transition-transform duration-200 ${
                openSection === sectionKey ? 'rotate-90' : ''
            }`}
        >
            <polyline points="9 18 15 12 9 6"/>
        </svg>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    {t('settings.title')}
                </h1>
                <p className="text-sm text-gray-500">{t('settings.subtitle')}</p>
            </div>

            <div className="border-t border-gray-200">
                {sections.map(section => (
                    <div key={section.key} className="border-b border-gray-200">
                        <button
                            onClick={() => toggleSection(section.key)}
                            className="w-full flex items-center justify-between py-5 text-left"
                        >
                            <span className="text-sm font-semibold text-black uppercase tracking-wide">
                                {section.title}
                            </span>
                            {chevron(section.key)}
                        </button>

                        {openSection === section.key && (
                            <div className="pb-6 space-y-4">
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

                                            {setting.key === 'auth_bg_type' ? (
                                                <div className="flex-1">
                                                    <select
                                                        value={setting.value}
                                                        onChange={async (e) => {
                                                            try {
                                                                await updateSettings(setting.id, e.target.value);
                                                                toast.success(t('messages.settingUpdated'));
                                                                fetchSettings();
                                                                window.dispatchEvent(new Event('settings-updated'));
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || t('messages.failedToUpdate'));
                                                            }
                                                        }}
                                                        className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                                                    >
                                                        <option value="color">{t('settings.authBgTypeColor')}</option>
                                                        <option value="image">{t('settings.authBgTypeImage')}</option>
                                                        <option value="none">{t('settings.authBgTypeNone')}</option>
                                                    </select>
                                                </div>
                                            ) : setting.key === 'auth_bg_color' ? (
                                                <div className="flex-1 flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={setting.value || '#000000'}
                                                        onChange={async (e) => {
                                                            try {
                                                                await updateSettings(setting.id, e.target.value);
                                                                setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: e.target.value } : s));
                                                                window.dispatchEvent(new Event('settings-updated'));
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || t('messages.failedToUpdate'));
                                                            }
                                                        }}
                                                        className="w-12 h-9 border border-gray-300 cursor-pointer"
                                                    />
                                                    <span className="text-sm text-gray-500">{setting.value}</span>
                                                </div>
                                            ) : setting.key === 'auth_bg_image' ? (
                                                <div className="flex-1 flex items-center gap-4">
                                                    {setting.value && (
                                                        <img
                                                            src={setting.value.startsWith('http') ? setting.value : `${import.meta.env.VITE_API_URL}${setting.value}`}
                                                            alt="Auth background"
                                                            className="h-16 w-28 object-cover border border-gray-200"
                                                        />
                                                    )}
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={removeBgAuth}
                                                            onChange={(e) => setRemoveBgAuth(e.target.checked)}
                                                            className="w-3.5 h-3.5"
                                                        />
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                                                            {t('admin.removeBackground')}
                                                        </span>
                                                    </label>
                                                    <label className="cursor-pointer">
                                                        <div className="border border-gray-300 text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-50 transition-colors">
                                                            {setting.value ? t('settings.changeImage') : t('settings.uploadImage')}
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept=".jpg,.jpeg,.png,.webp"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;
                                                                e.target.value = '';
                                                                try {
                                                                    const response = await uploadImage(file, removeBgAuth);
                                                                    await updateSettings(setting.id, response.data.url);
                                                                    toast.success(t('messages.settingUpdated'));
                                                                    fetchSettings();
                                                                    window.dispatchEvent(new Event('settings-updated'));
                                                                } catch (err) {
                                                                    toast.error(err.response?.data?.message || t('messages.failedToUploadImage'));
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {setting.value && (
                                                        <button
                                                            onClick={async () => {
                                                                await updateSettings(setting.id, '');
                                                                fetchSettings();
                                                                window.dispatchEvent(new Event('settings-updated'));
                                                            }}
                                                            className="text-xs text-red-400 hover:text-red-600 underline"
                                                        >
                                                            {t('common.remove')}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : setting.key === 'store_tagline' ? (
                                                <div className="flex-1">
                                                    <RichTextEditor
                                                        value={setting.value}
                                                        onChange={async (html) => {
                                                            setSettings(prev => prev.map(s =>
                                                                s.id === setting.id ? { ...s, value: html } : s
                                                            ));
                                                        }}
                                                        placeholder={t('settings.store_tagline')}
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await updateSettings(setting.id, setting.value);
                                                                toast.success(t('messages.settingUpdated'));
                                                                fetchSettings();
                                                                window.dispatchEvent(new Event('settings-updated'));
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || t('messages.failedToSave'));
                                                            }
                                                        }}
                                                        className="mt-2 bg-black text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-gray-800 transition-colors"
                                                    >
                                                        {t('common.save')}
                                                    </button>
                                                </div>
                                            ) : setting.key === 'default_language' ? (
                                                <div className="flex-1">
                                                    <select
                                                        value={setting.value}
                                                        onChange={async (e) => {
                                                            try {
                                                                await updateSettings(setting.id, e.target.value);
                                                                toast.success(t('messages.settingUpdated'));
                                                                fetchSettings();
                                                                window.dispatchEvent(new Event('settings-updated'));
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || t('messages.failedToUpdate'));
                                                            }
                                                        }}
                                                        className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="sr">Serbian (Srpski)</option>
                                                    </select>
                                                </div>
                                            ) : ['delivery_fee', 'free_shipping_threshold'].includes(setting.key) ? (
                                                <div className="flex-1 flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={setting.value}
                                                        onChange={async (e) => {
                                                            const val = e.target.value;
                                                            try {
                                                                await updateSettings(setting.id, val);
                                                                setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: val } : s));
                                                                window.dispatchEvent(new Event('settings-updated'));
                                                            } catch (err) {
                                                                toast.error(err.response?.data?.message || t('messages.failedToUpdate'));
                                                            }
                                                        }}
                                                        onBlur={() => { toast.success(t('messages.settingUpdated')); fetchSettings(); }}
                                                        className="w-32 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                                                    />
                                                    <span className="text-xs text-gray-400">RSD</span>
                                                    {setting.key === 'free_shipping_threshold' && (
                                                        <span className="text-xs text-gray-400 ml-1">{t('settings.freeShippingHint')}</span>
                                                    )}
                                                </div>
                                            ) : ['payment_card_enabled',
                                                'payment_cod_enabled',
                                                'find_in_store_enabled',
                                                'reviews_enabled',
                                                'favorites_enabled',
                                                'contact_enabled',
                                                'add_to_cart_enabled',
                                                'multilanguage_enabled',
                                                'registration_enabled',
                                                'login_enabled',
                                                'delivery_enabled'].includes(setting.key) ? (
                                                <div className="flex-1 flex items-center gap-3">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const newValue = setting.value === 'true' ? 'false' : 'true';
                                                                await updateSettings(setting.id, newValue);
                                                                toast.success(newValue === 'true'
                                                                    ? t('messages.settingEnabled', { name: setting.label })
                                                                    : t('messages.settingDisabled', { name: setting.label }));
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
                                                                accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
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
                        )}
                    </div>
                ))}

                {/* Filter Configuration */}
                <div className="border-b border-gray-200">
                    <button
                        onClick={() => toggleSection('filters')}
                        className="w-full flex items-center justify-between py-5 text-left"
                    >
                        <span className="text-sm font-semibold text-black uppercase tracking-wide">
                            {t('settings.productFilters')}
                        </span>
                        {chevron('filters')}
                    </button>

                    {openSection === 'filters' && (
                        <div className="pb-6">
                            <p className="text-xs text-gray-400 mb-4">
                                {t('settings.filterToggleDesc')}
                            </p>
                            <div className="space-y-3">
                                {filters.map(filter => (
                                    <div key={filter.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;