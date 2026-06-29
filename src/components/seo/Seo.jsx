const SITE_NAME = 'NoPressure Wear';
const DEFAULT_DESC = 'Premium minimalist clothing. Be relaxed. Live easy.';

const Seo = ({ title, description, image, url, type = 'website' }) => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    const desc = description || DEFAULT_DESC;

    return (
        <>
            <title>{fullTitle}</title>
            <meta name="description" content={desc} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={desc} />
            <meta property="og:type" content={type} />
            {url && <meta property="og:url" content={url} />}
            {image && <meta property="og:image" content={image} />}
            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={desc} />
            {image && <meta name="twitter:image" content={image} />}
        </>
    );
};

export default Seo;
