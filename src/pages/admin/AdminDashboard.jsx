import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { isAdmin } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                {t('admin.dashboard')}
            </h1>
            <p className="text-gray-500 text-sm mb-10">{t('admin.manageStore')}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/admin/products"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        {t('admin.products')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('admin.manageProducts')}
                    </p>
                </Link>

                <Link
                    to="/admin/orders"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        {t('admin.orders')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('admin.manageOrders')}
                    </p>
                </Link>

                <Link
                    to="/admin/categories"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        {t('admin.categories')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('admin.manageCategories')}
                    </p>
                </Link>

                <Link
                    to="/admin/coupons"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        {t('admin.coupons')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('admin.manageCoupons')}
                    </p>
                </Link>

                {isAdmin() && (
                    <Link
                        to="/admin/employees"
                        className="border border-gray-200 p-8 hover:border-black transition-colors group"
                    >
                        <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                            {t('admin.employees')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t('admin.manageEmployees')}
                        </p>
                    </Link>
                )}

                <Link
                    to="/admin/banners"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        {t('admin.banners')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('admin.manageBanners')}
                    </p>
                </Link>
                <Link
                    to="/admin/customers"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        {t('admin.customers')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('admin.manageCustomers')}
                    </p>
                </Link>
                {isAdmin() && (
                    <Link
                        to="/admin/settings"
                        className="border border-gray-200 p-8 hover:border-black transition-colors group"
                    >
                        <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                            {t('admin.settings')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t('admin.manageSettings')}
                        </p>
                    </Link>
                )}
                {isAdmin() && (
                    <Link
                        to="/admin/popups"
                        className="border border-gray-200 p-8 hover:border-black transition-colors group"
                    >
                        <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                            {t('admin.popups')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t('admin.managePopups')}
                        </p>
                    </Link>
                )}
                {isAdmin() && (
                    <Link
                        to="/admin/stores"
                        className="border border-gray-200 p-8 hover:border-black transition-colors group"
                    >
                        <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                            {t('admin.storeLocations')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t('admin.manageStoreLocations')}
                        </p>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
