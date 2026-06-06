import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { isAdmin } = useAuth();

    const sections = [
        ...(isAdmin() ? [{
            title: t('admin.sectionManagement'),
            items: [
                { to: '/admin/settings', title: t('admin.settings'), desc: t('admin.manageSettings') },
                { to: '/admin/employees', title: t('admin.employees'), desc: t('admin.manageEmployees') },
            ]
        }] : []),
        {
            title: t('admin.sectionCatalog'),
            items: [
                { to: '/admin/products', title: t('admin.products'), desc: t('admin.manageProducts') },
                { to: '/admin/categories', title: t('admin.categories'), desc: t('admin.manageCategories') },
            ]
        },
        {
            title: t('admin.sectionSales'),
            items: [
                { to: '/admin/orders', title: t('admin.orders'), desc: t('admin.manageOrders') },
                { to: '/admin/customers', title: t('admin.customers'), desc: t('admin.manageCustomers') },
                { to: '/admin/coupons', title: t('admin.coupons'), desc: t('admin.manageCoupons') },
            ]
        },
        {
            title: t('admin.sectionMarketing'),
            items: [
                { to: '/admin/banners', title: t('admin.banners'), desc: t('admin.manageBanners') },
                { to: '/admin/popups', title: t('admin.popups'), desc: t('admin.managePopups') },
            ]
        },
        {
            title: t('admin.sectionStore'),
            items: [
                { to: '/admin/stores', title: t('admin.storeLocations'), desc: t('admin.manageStoreLocations') },
            ]
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                {t('admin.dashboard')}
            </h1>
            <p className="text-gray-500 text-sm mb-10">{t('admin.manageStore')}</p>

            <div className="space-y-10">
                {sections.map(section => (
                    <div key={section.title}>
                        <h2 className="text-xs font-black uppercase tracking-wide text-gray-400 mb-4 pb-2 border-b border-gray-200">
                            {section.title}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.items.map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                                >
                                    <h3 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
