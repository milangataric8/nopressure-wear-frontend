import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.argv[2] ? path.resolve(process.argv[2]) : fileURLToPath(new URL('../', import.meta.url));
const namespaces = ['common', 'catalog', 'checkout', 'auth', 'admin'];
const errors = [];
const flat = (obj, prefix = '') => Object.fromEntries(Object.entries(obj).flatMap(([key, value]) => {
    const full = prefix ? prefix + '.' + key : key;
    return value && typeof value === 'object' ? Object.entries(flat(value, full)) : [[full, value]];
}));
const placeholders = value => [...String(value).matchAll(/{{-?\s*([^},]+)(?:,[^}]*)?}}/g)].map(m => m[1].trim()).sort();
const all = { sr: {}, en: {} };
for (const ns of namespaces) {
    const dict = Object.fromEntries(['sr', 'en'].map(lang => [lang, flat(JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/locales', lang, ns + '.json'), 'utf8')))]));
    for (const key of new Set([...Object.keys(dict.sr), ...Object.keys(dict.en)])) {
        for (const lang of ['sr', 'en']) {
            const plural = key.match(/_(zero|one|two|few|many|other)$/)?.[1];
            if (plural && !new Intl.PluralRules(lang).resolvedOptions().pluralCategories.includes(plural)) continue;
            if (typeof dict[lang][key] !== 'string' || !dict[lang][key].trim()) errors.push(lang + '/' + ns + ': missing or empty ' + key);
            if (Object.hasOwn(all[lang], key)) errors.push('Duplicate key across namespaces: ' + key);
        }
        if (dict.sr[key] !== undefined && dict.en[key] !== undefined && JSON.stringify(placeholders(dict.sr[key])) !== JSON.stringify(placeholders(dict.en[key]))) errors.push(ns + ': placeholder mismatch for ' + key);
    }
    for (const lang of ['sr', 'en']) Object.assign(all[lang], dict[lang]);
}
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
for (const file of walk(path.join(root, 'src')).filter(p => /\.(jsx|js)$/.test(p) && !p.includes(path.sep + 'i18n' + path.sep))) {
    const source = fs.readFileSync(file, 'utf8');
    const references = [
        ...source.matchAll(/(?:\bt|\bi18n\.t)\(\s*['"]([^'"]+)['"]/g),
        ...source.matchAll(/getApiErrorMessage\([^,]+,\s*['"]([^'"]+)['"]/g),
    ];
    for (const match of references) {
        const key = match[1].replace(/^[^:]+:/, '');
        // i18next resolves plural base keys using locale-specific suffixes.
        for (const lang of ['sr','en']) if (!(key in all[lang]) && !Object.keys(all[lang]).some(k => k.startsWith(key + '_'))) errors.push(path.relative(root,file) + ': unknown ' + lang + ' key ' + key);
    }
    if (/\.response\?\.data\?\.message(?!Key)/.test(source)) errors.push(path.relative(root,file) + ': raw API message access');
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exitCode = 1; }
else console.log('Translation keys, placeholders and static UI references are valid for sr/en.');
