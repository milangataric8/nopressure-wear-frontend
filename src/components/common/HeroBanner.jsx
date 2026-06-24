import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveBanners } from '../../api/bannerApi';
import { getImageUrl } from '../../utils/imageUtils';
import { useTranslation } from 'react-i18next';

const HeroBanner = () => {
    const { t } = useTranslation();
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActiveBanners()
            .then(r => setBanners(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(i => (i + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    if (loading || banners.length === 0) {
        return (
            <div className="bg-gray-100 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                        New Collection
                    </p>
                    <h1 className="text-6xl font-black uppercase tracking-tight text-black mb-6 leading-none">
                        Just Do It.
                    </h1>
                    <p className="text-gray-500 text-lg mb-10 max-w-md">
                        Discover the latest products and find your perfect match.
                    </p>
                    <Link
                        to="/products"
                        className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-4 hover:bg-gray-800 transition-colors inline-block"
                    >
                        {t('product.shopNow')}
                    </Link>
                </div>
            </div>
        );
    }

    const banner = banners[currentIndex];

    return (
        <div className="relative h-[700px] overflow-hidden">
            {/* Media */}
            {banner.mediaType === 'VIDEO' ? (
                <video
                    key={banner.id}
                    src={getImageUrl(banner.mediaUrl)}
                    autoPlay
                    muted
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : banner.mediaUrl ? (
                <img
                    key={banner.id}
                    src={getImageUrl(banner.mediaUrl)}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                />
            ) : (
                <div className="absolute inset-0 bg-gray-100" />
            )}

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
                {(banner.displayTitle ?? true) && banner.title && (
                    <h1 className="text-6xl font-black uppercase tracking-tight text-white mb-4 leading-none">
                        {banner.title}
                    </h1>
                )}
                {banner.subtitle && (
                    <p className="text-white/80 text-lg mb-8 max-w-md">
                        {banner.subtitle}
                    </p>
                )}
                {banner.buttonText && banner.buttonLink && (
                    <Link
                        to={banner.buttonLink}
                        className="bg-white text-black text-sm font-semibold uppercase tracking-wide px-8 py-4 hover:bg-gray-200 transition-colors inline-block w-fit"
                    >
                        {banner.buttonText}
                    </Link>
                )}
            </div>

            {/* Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-2 h-2 transition-colors ${
                                i === currentIndex ? 'bg-white' : 'bg-white/40'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Prev/Next arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrentIndex(i => (i - 1 + banners.length) % banners.length)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-10 h-10 flex items-center justify-center transition-colors"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => setCurrentIndex(i => (i + 1) % banners.length)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-10 h-10 flex items-center justify-center transition-colors"
                    >
                        →
                    </button>
                </>
            )}
        </div>
    );
};

export default HeroBanner;
