import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GENDERS = [
    { key: 'MEN',   labelKey: 'nav.men' },
    { key: 'WOMEN', labelKey: 'nav.women' },
];

const ProductsMegaMenu = ({ categories, onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="absolute left-0 top-full pt-4 z-50">
            <div className="bg-white border border-gray-200 shadow-lg flex gap-10 p-6 min-w-[380px]">
                {GENDERS.map(g => (
                    <div key={g.key} className="min-w-[130px]">
                        <Link
                            to={`/products?gender=${g.key}`}
                            onClick={onNavigate}
                            className="block text-xs font-black uppercase tracking-wide text-black mb-3 hover:underline whitespace-nowrap"
                        >
                            {t(g.labelKey)}
                        </Link>
                        <div className="space-y-1.5">
                            {categories.map(cat => (
                                <Link
                                    key={cat.id}
                                    to={`/products?gender=${g.key}&category=${cat.id}`}
                                    onClick={onNavigate}
                                    className="block text-xs text-gray-500 hover:text-black transition-colors py-0.5 whitespace-nowrap"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="border-l border-gray-100 pl-6 flex flex-col justify-end">
                    <Link
                        to="/products"
                        onClick={onNavigate}
                        className="text-xs font-semibold uppercase tracking-wide text-black hover:underline whitespace-nowrap"
                    >
                        {t('nav.viewAllProducts')} →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductsMegaMenu;
