import { useTranslation } from 'react-i18next';

// Label (+ required `*`) + field slot + inline error / hint, so the red-state
// markup lives in one place instead of being copied across ~12 forms.
//
// `error` accepts three shapes:
//   - i18n key string ('validation.required')  → translated here
//   - { key, params }                          → interpolated here
//   - plain server text ('Email is taken')     → shown as-is (t() echoes unknown keys)
const FormField = ({ id, name, label, required, error, hint, children }) => {
    const { t } = useTranslation();
    const fieldId = id || name;

    let message = null;
    if (error) {
        if (typeof error === 'object' && error.key) {
            message = t(error.key, error.params);
        } else {
            const translated = t(error);
            message = translated === error ? error : translated;
        }
    }

    return (
        <div>
            {label && (
                <label htmlFor={fieldId} className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                    {label}
                    {required && <span className="text-red-500" aria-hidden="true"> *</span>}
                </label>
            )}

            {children}

            {message ? (
                <p id={fieldId ? `${fieldId}-error` : undefined} role="alert" className="text-xs text-red-500 mt-1">
                    {message}
                </p>
            ) : hint ? (
                <p className="text-xs text-gray-500 mt-1">{hint}</p>
            ) : null}
        </div>
    );
};

export default FormField;
