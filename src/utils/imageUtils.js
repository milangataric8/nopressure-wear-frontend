export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${import.meta.env.VITE_API_URL}${imageUrl}`;
};

// Cloudinary-aware optimized image URL.
// For Cloudinary URLs, injects f_auto,q_auto,dpr_auto + optional resize transforms.
// For local/non-Cloudinary URLs, falls back to getImageUrl (no-op until Cloudinary is adopted).
export function optimizedImage(url, { width, height, crop = 'fit' } = {}) {
    if (!url) return null;
    if (url.includes('/image/upload/')) {
        const transforms = ['f_auto', 'q_auto', 'dpr_auto'];
        if (width)  transforms.push(`w_${width}`);
        if (height) transforms.push(`h_${height}`);
        if (width || height) transforms.push(`c_${crop}`);
        return url.replace('/image/upload/', `/image/upload/${transforms.join(',')}/`);
    }
    return getImageUrl(url);
}