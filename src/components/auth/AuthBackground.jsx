import { useState, useEffect } from 'react';
import { getSettingsMap } from '../../api/settingsApi';
import { getImageUrl } from '../../utils/imageUtils';

const AuthBackground = () => {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        getSettingsMap().then(r => setSettings(r.data)).catch(() => {});
    }, []);

    if (settings.auth_bg_type === 'none') return null;

    const isImage = settings.auth_bg_type === 'image' && settings.auth_bg_image;

    return (
        <div
            className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden"
            style={{ backgroundColor: settings.auth_bg_color || '#000000' }}
        >
            {isImage && (
                <img
                    src={getImageUrl(settings.auth_bg_image)}
                    alt=""
                    className="absolute inset-0 m-auto max-w-md max-h-96 object-contain"
                />
            )}

            {(settings.auth_bg_heading || settings.auth_bg_subtext) && (
                <div className={`relative z-10 text-center px-12 ${isImage ? 'bg-black/30 py-10 w-full' : ''}`}>
                    {settings.auth_bg_heading && (
                        <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-3">
                            {settings.auth_bg_heading}
                        </h2>
                    )}
                    {settings.auth_bg_subtext && (
                        <p className="text-sm text-white/80">
                            {settings.auth_bg_subtext}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AuthBackground;