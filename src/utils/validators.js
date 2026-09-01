// Field validators for the shared admin/checkout form pattern.
//
// A validator takes (value, allValues) and returns:
//   - null / undefined                    → valid
//   - 'i18n.key'                          → invalid, message from that key
//   - { key: 'i18n.key', params: {...} }  → invalid, message from an interpolated key
//
// Validators return KEYS, not text, so switching language re-renders the right
// message without re-running validation. `FormField` resolves them.

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

export const required = (value) => (isEmpty(value) ? 'validation.required' : null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const email = (value) =>
    !value || EMAIL_RE.test(String(value).trim()) ? null : 'validation.emailInvalid';

export const minLength = (n) => (value) =>
    !value || String(value).length >= n ? null : { key: 'validation.minLength', params: { count: n } };

export const maxLength = (n) => (value) =>
    !value || String(value).length <= n ? null : { key: 'validation.maxLength', params: { count: n } };

export const positiveNumber = (value) => {
    if (isEmpty(value)) return null;
    const n = Number(value);
    if (Number.isNaN(n)) return 'validation.number';
    return n > 0 ? null : 'validation.positive';
};

// 1–100 inclusive; blank passes (use with `required` when mandatory).
export const percent = (value) => {
    if (isEmpty(value)) return null;
    const n = Number(value);
    if (Number.isNaN(n)) return 'validation.number';
    return n >= 1 && n <= 100 ? null : 'validation.percent';
};

// `other` may be a literal or a (allValues) => value getter, so it stays current.
export const matches = (other, key = 'validation.passwordsDoNotMatch') => (value, all) => {
    const target = typeof other === 'function' ? other(all) : other;
    return value === target ? null : key;
};

export const differentFrom = (other, key = 'validation.passwordSame') => (value, all) => {
    if (!value) return null;
    const target = typeof other === 'function' ? other(all) : other;
    return value !== target ? null : key;
};

// Rich-text editors emit "<p></p>" / "<p><br></p>" for an empty document.
export const richTextRequired = (html) =>
    String(html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim() ? null : 'validation.required';

// File inputs have no `value`; validate against a flag/URL kept in form state instead.
// `has` is a literal or a (allValues) => boolean getter.
export const requiredFile = (has, key = 'validation.imageRequired') => (value, all) =>
    (typeof has === 'function' ? has(all) : has) ? null : key;

// Select whose placeholder option has value "".
export const requiredSelect = (value) =>
    isEmpty(value) ? 'validation.selectOption' : null;
