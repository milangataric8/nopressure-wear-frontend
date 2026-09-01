// Central role model. Every permission check in the app goes through these helpers
// so that adding SUPER_ADMIN can't silently break an `=== 'ADMIN'` check somewhere.
// The frontend is NOT a security boundary — the backend enforces the same rules.

export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    CUSTOMER: 'CUSTOMER',
};

// Higher rank = more privilege. Roles not listed (USER / CUSTOMER / unknown) rank 0.
const RANK = {
    [ROLES.EMPLOYEE]: 1,
    [ROLES.ADMIN]: 2,
    [ROLES.SUPER_ADMIN]: 3,
};

const rankOf = (user) => RANK[user?.role] ?? 0;

export const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;

// "ADMIN and above" — IMPORTANT: this includes SUPER_ADMIN.
export const isAdminOrAbove = (user) => rankOf(user) >= RANK[ROLES.ADMIN];

// Any account with access to the admin panel at all.
export const isStaff = (user) => rankOf(user) >= RANK[ROLES.EMPLOYEE];

// Named capabilities — use these in routes and nav, not the rank helpers directly.
export const canAccessCatalog   = isStaff;
export const canManageOrders    = isAdminOrAbove;
export const canManageCustomers = isAdminOrAbove;
export const canManageMarketing = isAdminOrAbove;
export const canManageStore     = isAdminOrAbove;
export const canManageSettings  = isAdminOrAbove;
export const canManageLegal     = isAdminOrAbove;
export const canAccessReports   = isSuperAdmin;
export const canAccessEmployees = isSuperAdmin;

// Where a role lands after login / when leaving a page they can't see.
export const adminLandingPath = (user) =>
    isAdminOrAbove(user) ? '/admin' : isStaff(user) ? '/admin/products' : '/';
