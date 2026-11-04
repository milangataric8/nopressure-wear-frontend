import sr_common from './locales/sr/common.json' with { type: 'json' };
import sr_catalog from './locales/sr/catalog.json' with { type: 'json' };
import sr_checkout from './locales/sr/checkout.json' with { type: 'json' };
import sr_auth from './locales/sr/auth.json' with { type: 'json' };
import sr_admin from './locales/sr/admin.json' with { type: 'json' };
import en_common from './locales/en/common.json' with { type: 'json' };
import en_catalog from './locales/en/catalog.json' with { type: 'json' };
import en_checkout from './locales/en/checkout.json' with { type: 'json' };
import en_auth from './locales/en/auth.json' with { type: 'json' };
import en_admin from './locales/en/admin.json' with { type: 'json' };

export const namespaces = ["common","catalog","checkout","auth","admin"];
export const resources = {
    sr: { common: sr_common, catalog: sr_catalog, checkout: sr_checkout, auth: sr_auth, admin: sr_admin },
    en: { common: en_common, catalog: en_catalog, checkout: en_checkout, auth: en_auth, admin: en_admin },
};
