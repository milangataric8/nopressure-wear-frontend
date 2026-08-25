# Feature: Separate Mobile Banner Media

NoPressure Wear — banner images/videos are designed for wide desktop screens. On a phone, `object-cover` crops the sides and cuts off the artwork text ("NO PRESSURE" renders as "O PRESSUR"). Fix by letting each banner carry a second, portrait-oriented asset used on small screens.

Stack: Spring Boot backend, React + Vite + Tailwind, Cloudinary storage, existing `Banner` entity with `mediaUrl` + `mediaType` (IMAGE/VIDEO).

---

## Why cropping can't be fixed with CSS alone

`object-cover` fills the container and crops whatever doesn't fit. A 16:9 image inside a narrow phone viewport **must** lose its sides — that's the trade-off of the property, not a bug.

Reducing the banner height doesn't help: the crop happens on the **horizontal** axis, so a shorter box crops just as much width. The only way to show the whole 16:9 frame on a 9:16 screen is a very short letterbox strip, where any text in the artwork becomes unreadable.

`object-contain` avoids cropping but leaves empty bars above and below — acceptable as a stopgap, poor as a final design.

The real fix is a **separate asset authored for portrait**, which is what every serious storefront does. It works identically for images and video.

---

## 1. Database — Flyway migration

```sql
ALTER TABLE banner ADD COLUMN mobile_media_url VARCHAR(255);
ALTER TABLE banner ADD COLUMN mobile_media_type VARCHAR(20);
```

Both nullable — when a banner has no mobile asset, the desktop one is used as today (graceful fallback, no need to update existing banners immediately).

> `mobile_media_type` lets you pair, say, a desktop video with a mobile image if a portrait video isn't available.

---

## 2. Entity

```java
// Banner.java
@Column(name = "mobile_media_url")
private String mobileMediaUrl;

@Enumerated(EnumType.STRING)
@Column(name = "mobile_media_type", length = 20)
private MediaType mobileMediaType;
```

## 3. DTOs

Add to both `BannerRequest` and `BannerResponse`:
```java
private String mobileMediaUrl;
private MediaType mobileMediaType;
```

And map them in `BannerService` create / update / `toResponse`.

---

## 4. Admin — second upload slot

In `AdminBanners`, add a mobile media field beside the existing one. Reuse the same upload component/handler; only the target field differs.

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Desktop media — existing */}
    <div>
        <label className={labelClass}>
            {t('banner.desktopMedia')}
            <span className="block text-xs font-normal text-gray-400 normal-case mt-0.5">
                {t('banner.desktopHint')}   {/* "Horizontalno, npr. 1920×800" */}
            </span>
        </label>
        {/* existing upload + preview, writes to formData.mediaUrl / mediaType */}
    </div>

    {/* Mobile media — new */}
    <div>
        <label className={labelClass}>
            {t('banner.mobileMedia')}
            <span className="block text-xs font-normal text-gray-400 normal-case mt-0.5">
                {t('banner.mobileHint')}    {/* "Vertikalno, npr. 1080×1350. Ako je prazno, koristi se desktop." */}
            </span>
        </label>
        {/* same upload component, writes to formData.mobileMediaUrl / mobileMediaType */}
    </div>

</div>
```

Include `mobileMediaUrl` / `mobileMediaType` in `formData`, `resetForm`, and `handleEdit`.

**Recommended dimensions to put in the hint:**
- Desktop: ~1920×800 (wide, ~2.4:1)
- Mobile: ~1080×1350 (portrait 4:5) or 1080×1080 (square)

---

## 5. Frontend — render the right asset

### Images: use `<picture>` (browser picks, no JS, no layout shift)

```jsx
const BannerMedia = ({ banner }) => {
    const desktopUrl = optimizedImage(banner.mediaUrl, { width: 1920 });
    const mobileUrl = banner.mobileMediaUrl
        ? optimizedImage(banner.mobileMediaUrl, { width: 1080 })
        : desktopUrl;

    if (banner.mediaType === 'VIDEO' || banner.mobileMediaType === 'VIDEO') {
        return <BannerVideo banner={banner} />;
    }

    return (
        <picture>
            <source media="(max-width: 767px)" srcSet={mobileUrl} />
            <img
                src={desktopUrl}
                alt={banner.title || ''}
                className="w-full h-full object-cover"
                loading="eager"
            />
        </picture>
    );
};
```

`<picture>` is ideal here: the browser evaluates the media query **before** fetching, so a phone downloads only the portrait file — narrower crop *and* less data.

### Video: pick the source by viewport

`<video>` has no `media` attribute support that's reliable across browsers, so switch with a matchMedia hook:

```jsx
import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 767) => {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${breakpoint}px)`).matches
    );

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [breakpoint]);

    return isMobile;
};
```

```jsx
const BannerVideo = ({ banner }) => {
    const isMobile = useIsMobile();
    const useMobile = isMobile && banner.mobileMediaUrl;

    const src = useMobile ? banner.mobileMediaUrl : banner.mediaUrl;
    const type = useMobile ? banner.mobileMediaType : banner.mediaType;

    // mobile asset may be an image even when desktop is video
    if (type === 'IMAGE') {
        return (
            <img src={optimizedImage(src, { width: 1080 })} alt={banner.title || ''}
                 className="w-full h-full object-cover" />
        );
    }

    return (
        <video
            key={src}                     // force reload when the source switches
            src={src}
            className="w-full h-full object-cover"
            autoPlay muted loop playsInline
        />
    );
};
```

> `key={src}` matters — React reuses the `<video>` element otherwise and the new source is ignored.
> `playsInline` is required for autoplay on iOS.

### Container heights per breakpoint

Portrait artwork wants more vertical room on a phone than a wide desktop banner does:

```jsx
<div className="relative w-full overflow-hidden h-[60vh] sm:h-[55vh] lg:h-[70vh]">
    <BannerMedia banner={banner} />
    {/* overlay / arrows */}
</div>
```

---

## 6. Fallback behaviour

When `mobileMediaUrl` is empty, mobile falls back to the desktop asset — exactly the current behaviour. So:
- Nothing breaks for existing banners
- You can add mobile artwork one banner at a time
- Banners where the desktop crop happens to look fine need no mobile asset at all

---

## 7. i18n keys

```jsonc
// en.json — "banner"
"desktopMedia": "Desktop media",
"desktopHint": "Wide format, e.g. 1920×800",
"mobileMedia": "Mobile media",
"mobileHint": "Portrait, e.g. 1080×1350. Falls back to desktop if empty."

// sr.json — "banner"
"desktopMedia": "Medij za desktop",
"desktopHint": "Horizontalno, npr. 1920×800",
"mobileMedia": "Medij za mobilni",
"mobileHint": "Vertikalno, npr. 1080×1350. Ako je prazno, koristi se desktop."
```

---

## 8. Notes and gotchas

- **Breakpoint consistency:** `<picture>`'s `max-width: 767px` should match the `useIsMobile` breakpoint and your Tailwind `sm`/`md` boundary, or images and video will switch at different widths.
- **`<picture>` beats JS for images** — no flash of the wrong asset, no double download, works before hydration.
- **Cloudinary transforms still apply** — request `w_1080` for the mobile asset so phones don't download a 1920px file.
- **Video weight on mobile:** a portrait video should be short and compressed; consider a still image as the mobile asset even when desktop is video, which the separate `mobileMediaType` allows.
- **Text baked into artwork** is the underlying cause of the cropping being so visible. Where possible, prefer artwork without embedded text — but with two assets you keep full design control, which is why this approach works with video.
- **`object-contain` is not the fix** — it prevents cropping but leaves letterbox bars; use it only as a temporary measure before mobile artwork exists.

---

## 9. Checklist

- [ ] Flyway: `mobile_media_url`, `mobile_media_type` on `banner` (nullable)
- [ ] `Banner` entity fields; `BannerRequest`/`BannerResponse` + service mapping
- [ ] AdminBanners: second upload slot with dimension hints; wired into formData / resetForm / handleEdit
- [ ] Frontend `<picture>` for images with `max-width: 767px` source
- [ ] `useIsMobile` + `key={src}` for video switching; `playsInline` set
- [ ] Mobile asset requested at `w_1080` via Cloudinary
- [ ] Fallback to desktop asset when mobile is empty
- [ ] Responsive container heights
- [ ] i18n keys (EN + SR)
- [ ] Verified: phone shows full portrait artwork, desktop unchanged, video switches correctly, banners without mobile assets still work
