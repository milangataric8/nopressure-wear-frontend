import test from 'node:test';
import assert from 'node:assert/strict';
import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nOptions } from './options.js';

test('saved English choice survives reload; an empty browser starts in Serbian', async () => {
    const values = new Map();
    const previousWindow = globalThis.window;
    globalThis.window = { localStorage: {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key),
    } };
    try {
        const first = createInstance();
        await first.use(LanguageDetector).init(i18nOptions);
        assert.equal(first.resolvedLanguage, 'sr');
        await first.changeLanguage('en');
        const reloaded = createInstance();
        await reloaded.use(LanguageDetector).init(i18nOptions);
        assert.equal(reloaded.resolvedLanguage, 'en');
    } finally {
        if (previousWindow === undefined) delete globalThis.window;
        else globalThis.window = previousWindow;
    }
});
