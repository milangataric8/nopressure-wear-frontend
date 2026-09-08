import { resolveMediaUrl } from '../utils/resolveMediaUrl';

const StoreLogo = ({ logoUrl, storeName, className }) => {
    if (!logoUrl) {
        return (
            <span className="text-base font-black tracking-tight text-black uppercase">
                {storeName}
            </span>
        );
    }

    return (
        <img
            src={resolveMediaUrl(logoUrl)}
            alt={storeName}
            className={className}
        />
    );
};

export default StoreLogo;