import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../utils/imageUtils';
import { useCurrency } from '../../context/CurrencyContext';
import StatusBadge from '../common/StatusBadge';
import ResponsiveTable from './ResponsiveTable';

const ProductsTable = ({ products, page, totalPages, setPage, onEdit, onToggle, onDelete }) => {
    const { t } = useTranslation();
    const { format } = useCurrency();
    const navigate = useNavigate();

    const genderLabel = (gender) =>
        t(`product.gender${gender.charAt(0) + gender.slice(1).toLowerCase()}`);

    return (
        <ResponsiveTable
            rows={products}
            rowKey={(p) => p.id}
            onRowClick={(p) => navigate(`/products/${p.id}`)}
            emptyMessage={t('admin.noResults')}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            cellClassName="px-3 py-3"
            columns={[
                {
                    key: 'image',
                    label: t('admin.image'),
                    hideOnMobile: true,
                    render: (p) => (
                        <div className="w-13 h-13 overflow-hidden block">
                            {p.imageUrl ? (
                                <img
                                    src={getImageUrl(p.imageUrl)}
                                    alt={p.colorName || 'Variant'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full" style={{ backgroundColor: p.colorHex || '#ccc' }} />
                            )}
                        </div>
                    ),
                },
                {
                    key: 'product',
                    label: t('product.product'),
                    primary: true,
                    render: (p) => (
                        <>
                            <span className="block text-xs font-semibold text-black md:text-xs">{p.name}</span>
                            <span className="block text-xs text-gray-400">{p.categoryName || t('admin.noCategory')}</span>
                            {p.gender && (
                                <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 border border-gray-200 px-1.5 py-0.5">
                                    {genderLabel(p.gender)}
                                </span>
                            )}
                        </>
                    ),
                },
                {
                    key: 'sku',
                    label: t('admin.sku'),
                    hideOnMobile: true,
                    render: (p) => <span className="text-xs text-gray-500">{p.sku}</span>,
                },
                {
                    key: 'price',
                    label: t('product.price'),
                    render: (p) => <span className="text-xs font-semibold text-black">{format(p.price)}</span>,
                },
                {
                    key: 'stock',
                    label: t('product.stock'),
                    hideOnMobile: true,
                    render: (p) => <span className="text-xs text-black">{p.stockQuantity}</span>,
                },
                {
                    key: 'status',
                    label: t('order.status'),
                    render: (p) => <StatusBadge active={p.active} />,
                },
            ]}
            actions={(p) => (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                        className="text-xs text-gray-500 hover:text-black transition-colors underline"
                    >
                        {t('admin.edit')}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(p.id); }}
                        className="text-xs text-gray-500 hover:text-black transition-colors underline"
                    >
                        {p.active ? t('admin.deactivate') : t('admin.activate')}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                    >
                        {t('admin.delete')}
                    </button>
                </>
            )}
        />
    );
};

export default ProductsTable;
