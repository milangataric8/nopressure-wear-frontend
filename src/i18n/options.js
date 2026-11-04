import { namespaces, resources } from './resources.js';

export const i18nOptions = {
    resources,
    ns: namespaces,
    defaultNS: 'common',
    // Existing API/UI keys stay stable while each section has one owning namespace.
    fallbackNS: namespaces.filter(ns => ns !== 'common'),
    supportedLngs: ['sr', 'en'],
    load: 'languageOnly',
    fallbackLng: 'sr',
    interpolation: { escapeValue: false },
    detection: {
        // Use only an explicit saved choice; a new visitor starts in Serbian.
        order: ['localStorage'],
        caches: ['localStorage'],
    },
};
