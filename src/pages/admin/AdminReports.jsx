import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    getOverview, getRevenueByMonth, getOrdersByStatus,
    getTopProducts, getTopCustomers, getLowStock,
    getRevenueByCategory, getPaymentStats, getRecentOrders
} from '../../api/dashboardApi';
import { getImageUrl } from '../../utils/imageUtils';
import {
    downloadOrdersPdf, downloadOrdersExcel,
    downloadProductsPdf, downloadProductsExcel,
    downloadCustomersPdf, downloadCustomersExcel,
    downloadLowStockPdf, downloadLowStockExcel
} from '../../api/reportApi.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DownloadButtons from '../admin/DownloadButtons.jsx';
import {useCurrency} from "../../context/CurrencyContext.jsx";

const AdminReports = () => {
    const { t } = useTranslation();
    const [overview, setOverview] = useState(null);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [ordersByStatus, setOrdersByStatus] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [revenueByCategory, setRevenueByCategory] = useState([]);
    const [paymentStats, setPaymentStats] = useState({});
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { format } = useCurrency();

    useEffect(() => {
        Promise.all([
            getOverview(),
            getRevenueByMonth(),
            getOrdersByStatus(),
            getTopProducts(5),
            getTopCustomers(5),
            getLowStock(10),
            getRevenueByCategory(),
            getPaymentStats(),
            getRecentOrders(5),
        ]).then(([ov, rev, ord, tp, tc, ls, rc, ps, ro]) => {
            setOverview(ov.data);
            setRevenueByMonth(rev.data);
            setOrdersByStatus(ord.data);
            setTopProducts(tp.data);
            setTopCustomers(tc.data);
            setLowStock(ls.data);
            setRevenueByCategory(rc.data);
            setPaymentStats(ps.data);
            setRecentOrders(ro.data);
        }).catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        SHIPPED: 'bg-purple-100 text-purple-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    const maxRevenue = revenueByMonth.length > 0
        ? Math.max(...revenueByMonth.map(r => Number(r.revenue)))
        : 0;

    const maxCategoryRevenue = revenueByCategory.length > 0
        ? Math.max(...revenueByCategory.map(r => Number(r.revenue)))
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    {t('admin.reports')}
                </h1>
                <p className="text-sm text-gray-500">{t('admin.reportsSubtitle')}</p>
            </div>

            {/* Key Metrics */}
            {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="border border-gray-200 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('admin.totalRevenue')}</p>
                        <p className="text-xl font-black text-black">{format(overview.totalRevenue)}</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('admin.totalOrders')}</p>
                        <p className="text-xl font-black text-black">{overview.totalOrders}</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('admin.customers')}</p>
                        <p className="text-xl font-black text-black">{overview.totalCustomers}</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('admin.avgOrderValue')}</p>
                        <p className="text-xl font-black text-black">{format(overview.averageOrderValue)}</p>
                    </div>
                </div>
            )}

            {/* Period Stats */}
            {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="border border-gray-200 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('admin.todayRevenue')}</p>
                        <p className="text-lg font-bold text-black">{format(overview.todayRevenue)}</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('admin.todayOrders')}</p>
                        <p className="text-lg font-bold text-black">{overview.todayOrders}</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('admin.monthlyRevenue')}</p>
                        <p className="text-lg font-bold text-black">{format(overview.monthlyRevenue)}</p>
                    </div>
                    <div className="border border-gray-200 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t('admin.monthlyOrders')}</p>
                        <p className="text-lg font-bold text-black">{overview.monthlyOrders}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Revenue Chart */}
                <div className="border border-gray-200 p-6">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.revenueChart')}
                    </h2>
                    {revenueByMonth.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">{t('admin.noDataYet')}</p>
                    ) : (
                        <div className="space-y-3">
                            {revenueByMonth.map(item => (
                                <div key={item.month} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-16 flex-shrink-0">{item.month}</span>
                                    <div className="flex-1 bg-gray-100 h-6 relative">
                                        <div
                                            className="bg-black h-6"
                                            style={{ width: `${maxRevenue > 0 ? (Number(item.revenue) / maxRevenue) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-black w-28 text-right">
                                        {format(item.revenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Orders by Status */}
                <div className="border border-gray-200 p-6">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.ordersByStatus')}
                    </h2>
                    {ordersByStatus.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">{t('admin.noOrdersYet')}</p>
                    ) : (
                        <div className="space-y-3">
                            {ordersByStatus.map(item => (
                                <div key={item.status} className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className={`text-xs font-semibold uppercase px-2 py-1 ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {item.status}
                                    </span>
                                    <span className="text-sm font-bold text-black">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Payment Methods */}
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mt-8 mb-4">
                        {t('admin.paymentMethods')}
                    </h2>
                    <div className="flex gap-4">
                        <div className="flex-1 border border-gray-100 p-4 text-center">
                            <p className="text-xs text-gray-400 mb-1">{t('admin.cardPayment')}</p>
                            <p className="text-lg font-bold text-black">{paymentStats.card || 0}</p>
                        </div>
                        <div className="flex-1 border border-gray-100 p-4 text-center">
                            <p className="text-xs text-gray-400 mb-1">{t('cart.cashOnDelivery')}</p>
                            <p className="text-lg font-bold text-black">{paymentStats.cod || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Top Products */}
                <div className="border border-gray-200 p-6">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.topSellingProducts')}
                    </h2>
                    <DownloadButtons pdfFn={downloadProductsPdf} excelFn={downloadProductsExcel} />
                    {topProducts.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">{t('admin.noSalesYet')}</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div key={product.id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                                    <span className="text-xs font-bold text-gray-300 w-5">{index + 1}</span>
                                    <div className="w-10 h-10 bg-gray-100 flex-shrink-0 overflow-hidden">
                                        {product.imageurl ? (
                                            <img src={getImageUrl(product.imageurl)} alt={product.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-black truncate">{product.name}</p>
                                        <p className="text-xs text-gray-400">{format(product.price)}</p>
                                    </div>
                                    <span className="text-xs font-bold text-black">
                                        {t('admin.soldCount', { count: product.salescount })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Customers */}
                <div className="border border-gray-200 p-6">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.topCustomers')}
                    </h2>
                    <DownloadButtons pdfFn={downloadCustomersPdf} excelFn={downloadCustomersExcel} />
                    {topCustomers.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">{t('admin.noCustomersYet')}</p>
                    ) : (
                        <div className="space-y-3">
                            {topCustomers.map((customer, index) => (
                                <div key={customer.email} className="flex items-center gap-3 py-2 border-b border-gray-100">
                                    <span className="text-xs font-bold text-gray-300 w-5">{index + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-black">{customer.name}</p>
                                        <p className="text-xs text-gray-400">{customer.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-black">{format(customer.total_spent)}</p>
                                        <p className="text-xs text-gray-400">
                                            {t('admin.ordersCount', { count: customer.orders })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Revenue by Category */}
                <div className="border border-gray-200 p-6">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.revenueByCategory')}
                    </h2>
                    {revenueByCategory.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">{t('admin.noDataYet')}</p>
                    ) : (
                        <div className="space-y-3">
                            {revenueByCategory.map(item => (
                                <div key={item.category} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-24 flex-shrink-0 truncate">{item.category}</span>
                                    <div className="flex-1 bg-gray-100 h-5 relative">
                                        <div
                                            className="bg-black h-5"
                                            style={{ width: `${maxCategoryRevenue > 0 ? (Number(item.revenue) / maxCategoryRevenue) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-black w-28 text-right">
                                        {format(item.revenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alert */}
                <div className="border border-gray-200 p-6">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.lowStockAlert')}
                    </h2>
                    <DownloadButtons pdfFn={() =>
                        downloadLowStockPdf(10)} excelFn={() =>
                        downloadLowStockExcel(10)} />
                    {lowStock.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">{t('admin.wellStocked')}</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStock.map(product => (
                                <div key={product.id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-gray-100 flex-shrink-0 overflow-hidden">
                                        {product.imageurl ? (
                                            <img src={getImageUrl(product.imageurl)} alt={product.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-black truncate">{product.name}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 ${
                                        Number(product.stockquantity) === 0
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {t('admin.leftInStock', { count: product.stockquantity })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-black uppercase tracking-wide text-black">
                        {t('admin.recentOrders')}
                    </h2>
                    <div className="flex items-center gap-4">
                        <DownloadButtons pdfFn={downloadOrdersPdf} excelFn={downloadOrdersExcel} />
                        <Link to="/admin/orders" className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black transition-colors">
                            {t('product.viewAll')} →
                        </Link>
                    </div>
                </div>
                {recentOrders.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">{t('admin.noOrdersYet')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 pb-2">{t('admin.order')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 pb-2">{t('admin.customer')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 pb-2">{t('admin.amount')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 pb-2">{t('admin.status')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 pb-2">{t('admin.payment')}</th>
                                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 pb-2">{t('admin.date')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id} className="border-b border-gray-100">
                                    <td className="py-3 text-xs font-semibold text-black">#{order.ordercode}</td>
                                    <td className="py-3 text-xs text-gray-600">{order.customername}</td>
                                    <td className="py-3 text-xs font-semibold text-black">{format(order.totalamount)}</td>
                                    <td className="py-3">
                                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 ${statusColors[order.status] || 'bg-gray-100'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-xs text-gray-500">{order.paymentmethod}</td>
                                    <td className="py-3 text-xs text-gray-400">
                                        {new Date(order.createdat).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
