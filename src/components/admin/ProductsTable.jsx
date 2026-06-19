import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../utils/imageUtils';
import { useCurrency } from '../../context/CurrencyContext';
import StatusBadge from '../common/StatusBadge';
import Pagination from '../common/Pagination';

const ProductsTable = ({ products, page, totalPages, setPage, onEdit, onToggle }) => {
    const { t } = useTranslation();
    const { format } = useCurrency();
    const navigate = useNavigate();

    const thClass = "text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-3";

    return (
        <div className="border border-gray-200">
            <table className="w-full">
                <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                    <th className={thClass}>{t('admin.image')}</th>
                    <th className={thClass}>{t('product.product')}</th>
                    <th className={`hidden md:table-cell ${thClass}`}>{t('admin.sku')}</th>
                    <th className={thClass}>{t('product.price')}</th>
                    <th className={`hidden md:table-cell ${thClass}`}>{t('product.stock')}</th>
                    <th className={thClass}>{t('order.status')}</th>
                    <th className={thClass}>{t('admin.actions')}</th>
                </tr>
                </thead>
                <tbody>
                {products.map(product => (
                    <tr
                        key={product.id}
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <td className="px-3 py-3">
                            <div className="w-13 h-13 border-2 border-transparent transition-colors overflow-hidden block">
                                {product.imageUrl ? (
                                    <img
                                        src={getImageUrl(product.imageUrl)}
                                        alt={product.colorName || 'Variant'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full"
                                        style={{ backgroundColor: product.colorHex || '#ccc' }}
                                    />
                                )}
                            </div>
                        </td>
                        <td className="px-3 py-3">
                            <p className="text-xs font-semibold text-black">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.categoryName || t('admin.noCategory')}</p>
                        </td>
                        <td className="hidden md:table-cell px-3 py-3 text-xs text-gray-500">{product.sku}</td>
                        <td className="px-3 py-3 text-xs font-semibold text-black">{format(product.price)}</td>
                        <td className="hidden md:table-cell px-3 py-3 text-xs text-black">{product.stockQuantity}</td>
                        <td className="px-3 py-3">
                            <StatusBadge active={product.active} />
                        </td>
                        <td className="px-3 py-3">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    {t('admin.edit')}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggle(product.id); }}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    {product.active ? t('admin.deactivate') : t('admin.activate')}
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
    );
};

export default ProductsTable;