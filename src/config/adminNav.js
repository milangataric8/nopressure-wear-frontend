import {
    canAccessCatalog, canManageOrders, canManageCustomers, canManageMarketing,
    canManageStore, canManageSettings, canManageLegal, canAccessReports, canAccessEmployees,
} from '../utils/roles';

// Single source of truth for the admin navigation, consumed by both the desktop
// dropdown and the mobile hamburger menu in Navbar.jsx. Keeping one list means a
// new admin page can't go missing from one menu but not the other.
//
// `label` / `section` are i18n keys. `can` is a predicate from src/utils/roles.js —
// items the current user can't reach are filtered out, and a section with no
// remaining items is dropped entirely. `bold` renders the link in a heavier weight.
export const ADMIN_NAV = [
    {
        section: 'admin.sectionManagement',
        items: [
            { to: '/admin/settings', label: 'admin.settings', can: canManageSettings, bold: true },
            { to: '/admin/legal', label: 'admin.legal', can: canManageLegal },
            { to: '/admin/reports', label: 'admin.reports', can: canAccessReports },
            { to: '/admin/employees', label: 'admin.employees', can: canAccessEmployees },
        ],
    },
    {
        section: 'admin.sectionCatalog',
        items: [
            { to: '/admin/products', label: 'admin.products', can: canAccessCatalog },
            { to: '/admin/categories', label: 'admin.categories', can: canAccessCatalog },
        ],
    },
    {
        section: 'admin.sectionSales',
        items: [
            { to: '/admin/orders', label: 'admin.orders', can: canManageOrders },
            { to: '/admin/customers', label: 'admin.customers', can: canManageCustomers },
            { to: '/admin/coupons', label: 'admin.coupons', can: canManageOrders },
        ],
    },
    {
        section: 'admin.sectionMarketing',
        items: [
            { to: '/admin/banners', label: 'admin.banners', can: canManageMarketing },
            { to: '/admin/popups', label: 'admin.popups', can: canManageMarketing },
            { to: '/admin/notifications', label: 'admin.notifications', can: canManageMarketing },
        ],
    },
    {
        section: 'admin.sectionStore',
        items: [
            { to: '/admin/stores', label: 'admin.locations', can: canManageStore },
        ],
    },
];

// Sections with only the items the given user is allowed to see; empty sections removed.
export const visibleAdminNav = (user) =>
    ADMIN_NAV
        .map(group => ({ ...group, items: group.items.filter(i => i.can(user)) }))
        .filter(group => group.items.length > 0);
