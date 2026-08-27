// Shared helpers for building `tel:` and `mailto:` links from store settings values.
// Keeps the Footer and Contact page normalisation in sync.

export const telHref = (phone) => `tel:${(phone || '').replace(/[^\d+]/g, '')}`;

export const mailHref = (email, subject) =>
    `mailto:${email || ''}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
