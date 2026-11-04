import { getApiFieldErrors } from './apiError.js';
// Shared helpers for the inline field-validation pattern used across forms.
// See feature-inline-form-validation-frontend.md.

export const inputClass = "w-full border px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none transition-colors";
export const inputNormal = "border-gray-300 focus:border-black";
export const inputError = "border-red-500 focus:border-red-500";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Apply translated API field errors without exposing raw server text. */
export const applyServerErrors = (err, t, setErrors) => {
    const mapped = getApiFieldErrors(err, t);
    if (!Object.keys(mapped).length) return false;
    setErrors(mapped);
    focusFirstError();
    return true;
};

/**
 * Scrolls to and focuses the first field marked aria-invalid="true".
 * The setTimeout lets React apply the attribute before the query runs.
 */
export const focusFirstError = () => {
    setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]');
        if (first) {
            first.scrollIntoView({ behavior: 'smooth', block: 'center' });
            first.focus({ preventScroll: true });
        }
    }, 0);
};
