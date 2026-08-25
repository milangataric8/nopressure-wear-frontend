# Feature: Home Screen Icon (Web App Manifest)

NoPressure Wear — saving the site to an Android/iOS home screen produces a generic grey letter tile instead of the brand icon. Fix by adding a web app manifest with proper icon sizes and linking it from `index.html`.

Stack: React + Vite, static assets in `public/`, deployed on Vercel.

---

## Why the icon is missing

When Chrome adds a shortcut, it looks for a **web app manifest** listing icons at the sizes the launcher needs (192×192 and 512×512). With no manifest — or a manifest that isn't linked from the HTML — Chrome falls back to a generated tile with the first letter of the site name. That's the grey "N".

A favicon alone isn't enough: `favicon.ico` is 16–32px, far too small for a launcher icon.

---

## 1. Prepare the icon files

Place these in `public/` (served at the site root):

| File | Size | Purpose |
|---|---|---|
| `favicon.ico` | 16/32/48 | Browser tab |
| `favicon-32x32.png` | 32×32 | Browser tab (modern) |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `android-chrome-192x192.png` | 192×192 | Android launcher |
| `android-chrome-512x512.png` | 512×512 | Android splash / high-DPI |
| `maskable-icon-512x512.png` | 512×512 | Android adaptive (safe-zone padded) |

> You already have `android-chrome-512x512.png` in `public/`. If the rest were generated alongside it (a favicon generator usually outputs the whole set), you may only need the manifest below.

**Design notes for the launcher icon:**
- Use the **logo mark**, not the full horizontal wordmark — it has to read at ~48px.
- Give it an opaque background (white or black). A transparent PNG renders as a floating shape on some launchers.
- For the **maskable** variant, keep artwork inside the middle ~80% ("safe zone"). Android crops icons to circles/squircles depending on the launcher, and edge content gets cut.

---

## 2. Create the manifest

`public/site.webmanifest`:

```json
{
  "name": "NoPressure Wear",
  "short_name": "NoPressure",
  "description": "Premium minimalist clothing. Be relaxed. Live easy.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#111111",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

Key fields:
- **`short_name`** — shown under the icon; keep it under ~12 characters or the launcher truncates it.
- **`display: "standalone"`** — opens without browser chrome, so it feels like an app (this also removes the little Chrome badge on the icon).
- **`theme_color`** — colours the Android status bar.
- **`purpose: "maskable"`** — lets Android crop to its adaptive shape without clipping the logo.

---

## 3. Link it from `index.html`

In `<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#111111" />
```

The `<link rel="manifest">` line is the one that actually fixes the shortcut icon — without it the manifest file is never read.

`apple-touch-icon` is separate because **iOS ignores the manifest's icons** for home screen shortcuts and reads only that tag.

---

## 4. iOS extras (optional)

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="NoPressure" />
```

These make the iOS shortcut open full-screen and control the label under the icon.

---

## 5. Deploy and re-add the shortcut

```bash
git add public/site.webmanifest public/*.png index.html
git commit -m "feat: add web app manifest and home screen icons"
git push
```

Then, **importantly**:

1. Delete the existing shortcut from the home screen — Android caches the icon per shortcut and won't refresh it.
2. Open the site in Chrome, hard-refresh (⋮ → clear cache or open in a private tab).
3. ⋮ → **Add to Home screen** → the brand icon should appear in the preview.

> If the preview still shows the letter tile, the manifest isn't being read. Check the next section.

---

## 6. Verifying the manifest

**On desktop Chrome:** DevTools → **Application** tab → **Manifest**. It shows the parsed manifest, the icons it found, and any errors (missing file, wrong size, bad JSON).

**Direct check:** open `https://nopressurewear.com/site.webmanifest` — it should return the JSON, not a 404 or your `index.html`.

> ⚠️ **Vercel SPA rewrite gotcha:** your `vercel.json` rewrites `/(.*)` to `/index.html`. Real files in `public/` are matched first, so the manifest and PNGs are served correctly — but if you ever see `index.html` returned for the manifest URL, that rewrite is the reason and you'd need to exclude static files.

**Lighthouse:** DevTools → Lighthouse → check "Progressive Web App" for a report on manifest and icon completeness.

---

## 7. Notes

- **HTTPS is required** for manifest features — you have it on both the Vercel domain and `nopressurewear.com`.
- **The Chrome badge** (small Chrome logo on the corner of the icon, like on your current shortcut) disappears once `display: "standalone"` is set and the shortcut is re-added — that's what makes Vercel's icon look like a "real" app.
- **Icon caching is aggressive.** Always delete and re-add the shortcut when testing; refreshing the page won't update an existing one.
- **Generate the set quickly** with a favicon generator (e.g. realfavicongenerator.net) — upload one square logo and it outputs every size plus a starter manifest.
- **This is not a full PWA.** A manifest gives you the icon and standalone launch; offline support would need a service worker, which is a separate (and optional) step.

---

## 8. Checklist

- [ ] Icon PNGs in `public/`: 192, 512, maskable 512, apple-touch 180, favicons
- [ ] Launcher icon uses the logo mark on an opaque background
- [ ] Maskable icon keeps artwork within the central 80%
- [ ] `public/site.webmanifest` created with name, short_name, icons, display, theme_color
- [ ] `<link rel="manifest">` + `apple-touch-icon` + `theme-color` in `index.html`
- [ ] Deployed; `/site.webmanifest` returns JSON
- [ ] DevTools → Application → Manifest shows no errors
- [ ] Old shortcut deleted, new one added → brand icon appears
- [ ] Checked on Android and iOS
