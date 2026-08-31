// Single source of truth for the admin navigation, consumed by both the desktop
// dropdown and the mobile hamburger menu in Navbar.jsx. Keeping one list means a
// new admin page can't go missing from one menu but not the other.
//
// `label` / `section` are i18n keys. `adminOnly` sections are hidden from EMPLOYEE
// users. `bold` marks a link the menus render in a heavier weight.
export const ADMIN_NAV = [
    {
        section: 'admin.sectionManagement',
        adminOnly: true,
        items: [
            { to: '/admin/settings', label: 'admin.settings', bold: true },
            { to: '/admin/legal', label: 'admin.legal' },
            { to: '/admin/reports', label: 'admin.reports' },
            { to: '/admin/employees', label: 'admin.employees' },
        ],
    },
    {
        section: 'admin.sectionCatalog',
        items: [
            { to: '/admin/products', label: 'admin.products' },
            { to: '/admin/categories', label: 'admin.categories' },
        ],
    },
    {
        section: 'admin.sectionSales',
        items: [
            { to: '/admin/orders', label: 'admin.orders' },
            { to: '/admin/customers', label: 'admin.customers' },
            { to: '/admin/coupons', label: 'admin.coupons' },
        ],
    },
    {
        section: 'admin.sectionMarketing',
        items: [
            { to: '/admin/banners', label: 'admin.banners' },
            { to: '/admin/popups', label: 'admin.popups' },
            { to: '/admin/notifications', label: 'admin.notifications' },
        ],
    },
    {
        section: 'admin.sectionStore',
        items: [
            { to: '/admin/stores', label: 'admin.locations' },
        ],
    },
];
