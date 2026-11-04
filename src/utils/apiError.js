import i18n from '../i18n/i18n.js';

function translateKey(key, fallbackKey, translate = i18n.t.bind(i18n)) {
    const fallback = translate(fallbackKey);
    // Only known keys may reach the UI; never render a server sentence or an unknown key.
    if (typeof key !== 'string' || !/^[a-zA-Z][\w]*(?:[.:][\w]+)+$/.test(key)) return fallback;
    const value = translate(key, { defaultValue: fallback });
    return typeof value === 'string' && value !== key ? value : fallback;
}

export function getApiErrorMessage(error, fallbackKey = 'errors.unexpected', translate) {
    if (!error?.response) return (translate || i18n.t.bind(i18n))('messages.connectionFailed');
    return translateKey(error.response.data?.messageKey, fallbackKey, translate);
}

export function getApiFieldErrors(error, translate) {
    const fields = error?.response?.data?.fieldErrors;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return {};
    return Object.fromEntries(Object.entries(fields).map(([field, key]) =>
        [field, translateKey(key, 'validation.required', translate)]));
}
