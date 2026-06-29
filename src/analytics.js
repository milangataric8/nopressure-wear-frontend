let loaded = false;

export function enableAnalytics() {
    if (loaded) return;
    const id = import.meta.env.VITE_GA_ID;
    if (!id) return;
    loaded = true;

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false });
}

export function trackPageview(path) {
    if (window.gtag) window.gtag('event', 'page_view', { page_path: path });
}
