# Translation ownership

- Frontend UI and API error translations: src/i18n/locales/{sr,en}/{common,catalog,checkout,auth,admin}.json.
- Backend transactional emails: messages_sr.properties and messages_en.properties. The base messages.properties is Serbian.
- Editable business content (legal pages, product descriptions, footer): admin-managed database content, per language where supported.
- API sends stable code, messageKey, and fieldErrors. Never parse English sentences or display raw server messages. Use getApiErrorMessage and applyServerErrors.

Each top-level key belongs to one namespace. Existing dotted keys remain supported through fallbackNS, preserving the API contract. New code may use explicit namespace keys, for example catalog:product.featuredModels. Do not duplicate the same key across files.

First visit and unsupported languages use Serbian. Only a user's explicit saved selection changes the language; regional sr/en variants resolve to their base language. Missing English entries fall back to Serbian at runtime, but the build requires complete dictionaries.

Add a complete sentence in both languages. Keep interpolation parameter names identical; use i18next plural forms instead of joining fragments. Run npm run check:i18n and npm test. The checker is also a prebuild step, and CI runs tests before building. It checks key parity, empty strings, interpolation parameters, namespace collisions, static t() references and raw API message access. Dynamic keys need explicit tests; they cannot all be inferred statically.

When adding an API error key, add sr/en frontend translations in the same change workflow. Backend contract-key coverage is tested against the frontend dictionary during local validation; each project also has independent CI checks.
