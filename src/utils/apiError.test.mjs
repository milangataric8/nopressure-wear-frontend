import test from 'node:test';
import assert from 'node:assert/strict';
import i18n from '../i18n/i18n.js';
import { getApiErrorMessage, getApiFieldErrors } from './apiError.js';

test('API messages and per-field errors follow the selected language', async () => {
    await i18n.changeLanguage('sr');
    const error = { response: { data: { messageKey: 'errors.emailNotVerified', fieldErrors: { email: 'validation.email.taken' } } } };
    assert.equal(getApiErrorMessage(error), 'Potvrdite email adresu pre prijave.');
    assert.equal(getApiFieldErrors(error).email, 'Nalog sa ovom email adresom već postoji');
    await i18n.changeLanguage('en');
    assert.equal(getApiErrorMessage(error), 'Please verify your email address before signing in.');
    assert.notEqual(getApiFieldErrors(error).email, 'validation.email.taken');
});
test('unknown keys, raw text, empty field maps and network failures have safe localized fallbacks', async () => {
    await i18n.changeLanguage('sr');
    assert.equal(getApiErrorMessage({ response: { data: { messageKey: 'errors.unknown', message: 'database exception' } } }), i18n.t('errors.unexpected'));
    assert.equal(getApiErrorMessage({ response: { data: { messageKey: 'Internal database error' } } }), i18n.t('errors.unexpected'));
    assert.equal(getApiErrorMessage(new Error('network')), i18n.t('messages.connectionFailed'));
    assert.deepEqual(getApiFieldErrors({ response: { data: { fieldErrors: {} } } }), {});
    assert.deepEqual(getApiFieldErrors({ response: { data: { fieldErrors: { email: 'untranslated internal text' } } } }), { email: i18n.t('validation.required') });
});
