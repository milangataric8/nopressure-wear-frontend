import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getActivePopup } from '../../api/popupApi';
import { getImageUrl } from '../../utils/imageUtils';

const HomePopup = () => {
    const [popup, setPopup] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        getActivePopup().then(r => {
            if (r.data) {
                // Check if show once and already seen
                if (r.data.showOnce) {
                    const seen = localStorage.getItem(`popup_seen_${r.data.id}`);
                    if (seen) return;
                }
                setPopup(r.data);
                setVisible(true);
            }
        }).catch(() => {});
    }, []);

    const handleClose = useCallback(() => {
        setVisible(false);
        if (popup?.showOnce) {
            localStorage.setItem(`popup_seen_${popup.id}`, 'true');
        }
    }, [popup]);

    useEffect(() => {
        if (!popup) return;
        const seconds = popup.displayDuration ?? 0;
        if (!seconds || seconds <= 0) return;
        const timer = setTimeout(handleClose, seconds * 1000);
        return () => clearTimeout(timer);
    }, [popup, handleClose]);

    if (!visible || !popup) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Popup */}
            <div
                className="relative max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in"
                style={{ backgroundColor: popup.backgroundColor || '#FFFFFF' }}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity"
                    style={{ color: popup.textColor || '#000000' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>

                {/* Image */}
                {popup.mediaUrl && popup.mediaType === 'IMAGE' && (
                    <div className="w-full h-48 overflow-hidden">
                        <img
                            src={getImageUrl(popup.mediaUrl)}
                            alt={popup.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Video */}
                {popup.mediaUrl && popup.mediaType === 'VIDEO' && (
                    <div className="w-full h-48 overflow-hidden">
                        <video
                            src={getImageUrl(popup.mediaUrl)}
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-8 text-center">
                    <h2
                        className="text-2xl font-black uppercase tracking-tight mb-2"
                        style={{ color: popup.textColor || '#000000' }}
                    >
                        {popup.title}
                    </h2>

                    {popup.subtitle && (
                        <p
                            className="text-sm mb-4 opacity-70"
                            style={{ color: popup.textColor || '#000000' }}
                        >
                            {popup.subtitle}
                        </p>
                    )}

                    {popup.content && (
                        <div
                            className="product-description text-sm leading-relaxed mb-6 opacity-80"
                            style={{ color: popup.textColor || '#000000' }}
                            dangerouslySetInnerHTML={{ __html: popup.content }}
                        />
                    )}

                    {popup.buttonText && popup.buttonLink && (
                        <Link
                            to={popup.buttonLink}
                            onClick={handleClose}
                            className="inline-block text-sm font-semibold uppercase tracking-wide px-8 py-3 transition-colors"
                            style={{
                                backgroundColor: popup.textColor || '#000000',
                                color: popup.backgroundColor || '#FFFFFF',
                            }}
                        >
                            {popup.buttonText}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePopup;