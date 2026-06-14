import { useState, useEffect } from 'react';
import { getSettingsMap } from '../../api/settingsApi';
import { useTranslation } from 'react-i18next';
import SocialIcons from "./SocialIcons.jsx";
import {Link} from "react-router-dom";

const Footer = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({});
    const [storeSettings] = useState({});

    useEffect(() => {
        getSettingsMap().then(r => setSettings(prev => ({ ...prev, ...r.data }))).catch(() => {});
    }, []);

    useEffect(() => {
        getSettingsMap()
            .then(r => setSettings(r.data))
        const handler = () => {
            getSettingsMap().then(r => setSettings(r.data)).catch(() => {});
        };
        window.addEventListener('settings-updated', handler);
        return () => window.removeEventListener('settings-updated', handler);
    }, []);

    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(settings.footer_map_address || 'Novi Sad, Serbia')}&z=15&output=embed`;

    const hasSocials = settings.social_instagram || settings.social_facebook ||
        settings.social_x || settings.social_threads ||
        settings.social_tiktok || settings.social_youtube;

    return (
        <footer className="border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className={`grid grid-cols-1 md:grid-cols-2 ${hasSocials ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-12 mb-12`}>
                    {/* Brand */}
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wide text-black mb-3">
                            {settings.store_name || 'WEBSHOP'}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {settings.store_tagline || ''}
                        </p>
                    </div>

                    {/* Visit Us */}
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wide text-black mb-3">
                            {t('footer.visitUs')}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-500">
                            <p>{settings.footer_address || ''}</p>
                            <p>{settings.footer_city || ''}</p>
                            <div className="pt-2 space-y-1">
                                <p>{settings.footer_hours_weekday || ''}</p>
                                <p>{settings.footer_hours_saturday || ''}</p>
                                <p>{settings.footer_hours_sunday || ''}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    {storeSettings.contact_enabled !== 'false' && (
                        <div>
                            <Link to="/contact" className="text-sm font-black uppercase tracking-wide text-black mb-3 block hover:underline">
                                {t('footer.contact')}
                            </Link>
                            <div className="space-y-1 text-sm text-gray-500">
                                <p>{settings.footer_email || ''}</p>
                                <p>{settings.footer_phone || ''}</p>
                            </div>
                        </div>
                    )}

                    {/* Follow Us — only if any social link exists */}
                    {hasSocials && (
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wide text-black mb-3">
                                {t('footer.followUs')}
                            </h3>
                            <SocialIcons settings={settings} size="md" />
                        </div>
                    )}
                </div>

                {/* Map */}
                <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xs font-black uppercase tracking-wide text-black mb-4">
                        {t('footer.findUs')}
                    </h3>
                    <div className="h-48 overflow-hidden">
                        <iframe
                            src={mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Store Location"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-8 pt-6 text-center">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} {settings.store_name}. {t('footer.allRightsReserved')}.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;