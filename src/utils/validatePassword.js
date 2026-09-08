import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN } from '../constants/validation';

/**
 * Client-side password check, mirroring the backend rules exactly.
 *
 * Returns an i18n KEY describing the first violated rule, or null when valid.
 * Never returns a translated string — translation happens in FormField (or the
 * caller's own t()), and returning text here would double-translate.
 *
 * @param {string} value
 * @param {{ required?: boolean }} [options] `required: true` on create/register
 *        flows; false (default) on update flows where a blank value means
 *        "leave the password unchanged" and must not raise an error.
 * @returns {string | null}
 */
export const validatePassword = (value, { required = false } = {}) => {
    const password = value ?? '';

    if (!password.trim()) {
        return required ? 'validation.password.required' : null;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
        return 'validation.password.minLength';
    }
    if (!PASSWORD_PATTERN.test(password)) {
        return 'validation.password.format';
    }
    return null;
};
