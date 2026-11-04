import test from 'node:test';
import assert from 'node:assert/strict';
import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nOptions } from './options.js';

test('new visitors start in Serbian and existing dotted keys work across namespaces', async () => {
    const instance = createInstance();
    await instance.use(LanguageDetector).init(i18nOptions);
    assert.equal(instance.resolvedLanguage, 'sr');
    assert.equal(instance.t('product.featuredModels'), 'Istraži kolekciju');
    assert.equal(instance.t('catalog:product.featuredModels'), 'Istraži kolekciju');
});
test('English choice and regional language tags resolve, unsupported languages use Serbian', async () => {
    const instance = createInstance();
    await instance.init({ ...i18nOptions, lng: 'en-US' });
    assert.equal(instance.resolvedLanguage, 'en');
    assert.equal(instance.t('product.featuredModels'), 'Explore the collection');
    await instance.changeLanguage('sr-RS');
    assert.equal(instance.resolvedLanguage, 'sr');
    await instance.changeLanguage('de');
    assert.equal(instance.resolvedLanguage, 'sr');
});
test('missing English translations fall back to Serbian across namespaces', async () => {
    const instance = createInstance();
    await instance.init({ ...i18nOptions, lng: 'en' });
    instance.addResource('sr', 'catalog', 'test.serbianOnly', 'Rezervni tekst');
    assert.equal(instance.t('test.serbianOnly'), 'Rezervni tekst');
});
