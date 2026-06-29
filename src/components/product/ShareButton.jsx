import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const ShareButton = ({ product }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const url = window.location.href;
    const title = product.name;
    const text = `${product.name} — NoPressure Wear`;

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch (e) {
                // user cancelled — ignore
            }
        } else {
            setOpen(prev => !prev);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success(t('product.linkCopied'));
            setOpen(false);
        } catch (e) {
            toast.error(t('product.copyFailed'));
        }
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={handleShare}
                title={t('product.share')}
                className="group w-10 h-10 flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" className="fill-none group-hover:fill-black transition-colors" />
                    <circle cx="6" cy="12" r="3" className="fill-none group-hover:fill-black transition-colors" />
                    <circle cx="18" cy="19" r="3" className="fill-none group-hover:fill-black transition-colors" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" fill="none" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" fill="none" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-sm z-20 w-56">
                    <button
                        onClick={copyLink}
                        className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-gray-50 border-b border-gray-100"
                    >
                        {t('product.copyLink')}
                    </button>
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2.5 text-sm text-black hover:bg-gray-50 border-b border-gray-100"
                    >
                        WhatsApp
                    </a>
                    <a
                        href={`viber://forward?text=${encodeURIComponent(text + ' ' + url)}`}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2.5 text-sm text-black hover:bg-gray-50 border-b border-gray-100"
                    >
                        Viber
                    </a>
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2.5 text-sm text-black hover:bg-gray-50"
                    >
                        Facebook
                    </a>
                </div>
            )}
        </div>
    );
};

export default ShareButton;
