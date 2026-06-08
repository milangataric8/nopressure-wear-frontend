import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useTranslation } from 'react-i18next';
import { useState } from "react";

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [openSection, setOpenSection] = useState(null);
    const { isAdmin } = useAuth();

    const toggleSection = (section) => {
        setOpenSection(prev => prev === section ? null : section);
    };

    const sections = [
        ...(isAdmin() ? [{
            key: 'management',
            title: t('admin.sectionManagement'),
            items: [
                { to: '/admin/settings', title: t('admin.settings'), desc: t('admin.manageSettings') },
                { to: '/admin/employees', title: t('admin.employees'), desc: t('admin.manageEmployees') },
            ]
        }] : []),
        {
            key: 'catalog',
            title: t('admin.sectionCatalog'),
            items: [
                { to: '/admin/products', title: t('admin.products'), desc: t('admin.manageProducts') },
                { to: '/admin/categories', title: t('admin.categories'), desc: t('admin.manageCategories') },
            ]
        },
        {
            key: 'sales',
            title: t('admin.sectionSales'),
            items: [
                { to: '/admin/orders', title: t('admin.orders'), desc: t('admin.manageOrders') },
                { to: '/admin/customers', title: t('admin.customers'), desc: t('admin.manageCustomers') },
                { to: '/admin/coupons', title: t('admin.coupons'), desc: t('admin.manageCoupons') },
            ]
        },
        {
            key: 'marketing',
            title: t('admin.sectionMarketing'),
            items: [
                { to: '/admin/banners', title: t('admin.banners'), desc: t('admin.manageBanners') },
                { to: '/admin/popups', title: t('admin.popups'), desc: t('admin.managePopups') },
            ]
        },
        {
            key: 'store',
            title: t('admin.sectionStore'),
            items: [
                { to: '/admin/stores', title: t('admin.storeLocations'), desc: t('admin.manageStoreLocations') },
            ]
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">Manage your store</p>
            </div>

            <div className="border-t border-gray-200">
                {sections.map(section => (
                    <div key={section.key} className="border-b border-gray-200">
                        <button
                            onClick={() => toggleSection(section.key)}
                            className="w-full flex items-center justify-between py-5 text-left"
                        >
                            <span className="text-sm font-semibold text-black uppercase tracking-wide">
                                {section.title}
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18" height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className={`text-gray-400 transition-transform duration-200 ${
                                    openSection === section.key ? 'rotate-90' : ''
                                }`}
                            >
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>

                        {openSection === section.key && (
                            <div className="pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {section.items.map(item => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="border border-gray-200 p-6 hover:border-black transition-colors group"
                                    >
                                        <h3 className="text-sm font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
