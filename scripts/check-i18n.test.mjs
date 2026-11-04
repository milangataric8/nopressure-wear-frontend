import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function check(sr, en, source = '') {
    const tempRoot = path.resolve(os.tmpdir());
    const dir = fs.mkdtempSync(path.join(tempRoot, 'nopressure-i18n-'));
    try {
        for (const lang of ['sr', 'en']) {
            const locale = path.join(dir, 'src/i18n/locales', lang);
            fs.mkdirSync(locale, { recursive: true });
            for (const ns of ['common','catalog','checkout','auth','admin']) {
                fs.writeFileSync(path.join(locale, ns + '.json'), JSON.stringify(ns === 'common' ? (lang === 'sr' ? sr : en) : {}));
            }
        }
        fs.writeFileSync(path.join(dir, 'src/example.js'), source);
        return spawnSync(process.execPath, [fileURLToPath(new URL('./check-i18n.mjs', import.meta.url)), dir], { encoding: 'utf8' });
    } finally {
        // Only the directory created by this test, under the resolved temp root.
        if (!dir.startsWith(tempRoot + path.sep)) throw new Error('Unexpected fixture path');
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
test('translation check rejects missing keys, mismatched parameters and unknown API fallbacks', () => {
    assert.equal(check({ greeting: 'Zdravo' }, {}).status, 1);
    assert.equal(check({ greeting: 'Zdravo {{name}}' }, { greeting: 'Hello {{user}}' }).status, 1);
    assert.equal(check({}, {}, "getApiErrorMessage(error, 'errors.missing')").status, 1);
    assert.equal(check({}, {}, "t('missing.key')").status, 1);
});
test('translation check accepts locale-specific plurals and matching parameters', () => {
    const result = check({ items_one: '{{count}} proizvod', items_few: '{{count}} proizvoda', items_other: '{{count}} proizvoda' },
        { items_one: '{{count}} item', items_other: '{{count}} items' }, "t('items', { count: 2 })");
    assert.equal(result.status, 0, result.stderr);
});
