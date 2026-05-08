export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${import.meta.env.VITE_API_URL}${imageUrl}`;
};