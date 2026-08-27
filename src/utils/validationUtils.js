// Shared helpers for the inline field-validation pattern used across forms.
// See feature-inline-form-validation-frontend.md.

export const inputClass = "w-full border px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none transition-colors";
export const inputNormal = "border-gray-300 focus:border-black";
export const inputError = "border-red-500 focus:border-red-500";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Maps a server error response's field->key map (err.response.data.errors)
 * through i18n `t()` into the same shape as client-side `errors` state.
 * Returns true (and calls setErrors) if the response carried field errors, false otherwise.
 */
export const applyServerErrors = (err, t, setErrors) => {
    const serverErrors = err.response?.data?.errors;
    if (!serverErrors) return false;

    const mapped = Object.fromEntries(
        Object.entries(serverErrors).map(([field, key]) => [field, t(key)])
    );
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
