import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance'
import { getEmployees, updateEmployee } from "../../api/employeeApi.js";
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import ResponsiveTable from "../../components/admin/ResponsiveTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import FormField from "../../components/form/FormField.jsx";
import PasswordInput from "../../components/form/PasswordInput.jsx";
import { inputClass } from "../../components/form/inputStyles.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { required, email as emailRule, minLength } from "../../utils/validators.js";
import { applyServerErrors } from "../../utils/validationUtils.js";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES, isSuperAdmin } from '../../utils/roles.js';

// Typed exactly (case-sensitive, trimmed) to confirm handing SUPER_ADMIN to someone else.
const HANDOVER_CONFIRM_TEXT = 'SUPER ADMIN';

const roleBadgeClass = {
    [ROLES.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
    [ROLES.ADMIN]: 'bg-blue-100 text-blue-800',
    [ROLES.EMPLOYEE]: 'bg-gray-100 text-gray-700',
};

const EMPTY_CREATE = { firstName: '', lastName: '', email: '', password: '', role: ROLES.EMPLOYEE };
const EMPTY_EDIT = { firstName: '', lastName: '', email: '', role: ROLES.EMPLOYEE };

const createRules = {
    firstName: [required],
    lastName: [required],
    email: [required, emailRule],
    password: [required, minLength(8)],
    role: [required],
};
const editRules = {
    firstName: [required],
    lastName: [required],
    email: [required, emailRule],
    role: [required],
};

const AdminEmployees = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    // Non-null while the "type SUPER ADMIN to confirm" modal is open, for whichever
    // employee is being promoted. Only opens on submit, never on a plain select change.
    const [handoverTarget, setHandoverTarget] = useState(null);
    const [handoverInput, setHandoverInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeFilter, setActiveFilter] = useState(null);

    const createForm = useFormValidation(EMPTY_CREATE, createRules);
    const editForm = useFormValidation(EMPTY_EDIT, editRules);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };

            if (searchQuery) params.search = searchQuery;
            if (activeFilter !== null) params.active = activeFilter;

            const response = await getEmployees(params);
            setEmployees(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void fetchEmployees();
    },[page, searchQuery, activeFilter]);

    // Computed from the already-loaded page, not a fresh request — this is UX only,
    // the backend's 409 is what actually enforces "at least one active super admin".
    const activeSuperAdmins = employees.filter(e => e.role === ROLES.SUPER_ADMIN && e.active).length;
    const isLastSuperAdmin = (emp) => emp.role === ROLES.SUPER_ADMIN && emp.active && activeSuperAdmins === 1;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!createForm.submit()) return;
        try {
            await axiosInstance.post('/employees', createForm.values);
            toast.success(t('messages.employeeCreated'));
            setShowForm(false);
            createForm.reset(EMPTY_CREATE);
            await fetchEmployees();
        } catch (error) {
            if (!applyServerErrors(error, t, createForm.setErrors)) {
                toast.error(error.response?.data?.message || t('messages.failedToSave'));
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('messages.confirmDelete'))) return;
        try {
            await axiosInstance.delete(`/employees/${id}`);
            toast.success(t('messages.employeeDeleted'));
            await fetchEmployees();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const handleToggle = async (employee) => {
        try {
            if (employee.active) {
                await axiosInstance.patch(`/employees/${employee.id}/deactivate`);
            } else {
                await axiosInstance.patch(`/employees/${employee.id}/activate`);
            }
            fetchEmployees();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToUpdate'));
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        editForm.reset({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role || ROLES.EMPLOYEE,
        });
        setShowEditForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closeEditForm = () => {
        setShowEditForm(false);
        setEditingEmployee(null);
        setHandoverTarget(null);
        setHandoverInput('');
        editForm.reset(EMPTY_EDIT);
    };

    // Shared by the plain-confirm path and the handover-modal path — one request either way,
    // never a separate "update fields" + "change role" pair (a partial failure would leave
    // the name saved but the role change lost).
    const submitEmployeeUpdate = async (role) => {
        try {
            await updateEmployee(editingEmployee.id, {
                firstName: editForm.values.firstName,
                lastName: editForm.values.lastName,
                email: editForm.values.email,
                role,
            });
            toast.success(t('messages.employeeUpdated'));
            closeEditForm();
            await fetchEmployees();
        } catch (e) {
            const status = e.response?.status;
            const message = e.response?.data?.message;
            if (status === 409) {
                // e.g. "would leave zero active super admins" — the attempt didn't take,
                // so the form's role field shouldn't keep showing it as if it had.
                toast.error(message || t('messages.superAdminInvariant'));
                editForm.setFieldValue('role', editingEmployee.role);
                setHandoverTarget(null);
                setHandoverInput('');
            } else if (status === 403) {
                // the axios interceptor already toasted "not authorized" without logging out
            } else if (!applyServerErrors(e, t, editForm.setErrors)) {
                toast.error(message || t('messages.failedToSave'));
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editForm.submit()) return;

        const roleChanged = editForm.values.role !== editingEmployee.role;
        if (!roleChanged) {
            await submitEmployeeUpdate(editForm.values.role);
            return;
        }

        if (editForm.values.role === ROLES.SUPER_ADMIN) {
            setHandoverTarget(editingEmployee);
            return;
        }

        const name = `${editingEmployee.firstName} ${editingEmployee.lastName}`.trim();
        if (!window.confirm(t('admin.confirmRoleChange', { name, from: editingEmployee.role, to: editForm.values.role }))) return;
        await submitEmployeeUpdate(editForm.values.role);
    };

    const confirmHandover = async () => {
        if (handoverInput.trim() !== HANDOVER_CONFIRM_TEXT) return;
        await submitEmployeeUpdate(ROLES.SUPER_ADMIN);
    };

    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    const roleBadge = (role) => (
        <span className={`inline-block whitespace-nowrap px-2 py-1 text-xs font-semibold uppercase ${roleBadgeClass[role] || 'bg-gray-100 text-gray-700'}`}>
            {role?.replace('_', ' ')}
        </span>
    );

    const isSelfEditing = editingEmployee && user?.id === editingEmployee.id;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
            <AdminPageHeader
                title={t('admin.employees')}
                subtitle={t('admin.manageEmployees')}
                buttonLabel={showForm ? t('admin.cancel') : t('admin.newEmployee')}
                onButtonClick={() => showForm ? setShowForm(false) : setShowForm(true)}
            />

            {!showForm && (
                <AdminSearchFilter
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    setPage={setPage}
                    searchPlaceholder={t('admin.searchEmployees')}
                />
            )}

            {/* Create form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.newEmployee')}
                    </h2>
                    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="firstName" name="firstName" label={t('auth.firstName')} required error={createForm.errors.firstName}>
                            <input
                                id="firstName" name="firstName" type="text"
                                value={createForm.values.firstName}
                                onChange={createForm.handleChange}
                                onBlur={createForm.handleBlur}
                                aria-invalid={!!createForm.errors.firstName}
                                aria-describedby={createForm.errors.firstName ? 'firstName-error' : undefined}
                                className={inputClass(!!createForm.errors.firstName)}
                                placeholder="First name"
                            />
                        </FormField>

                        <FormField id="lastName" name="lastName" label={t('auth.lastName')} required error={createForm.errors.lastName}>
                            <input
                                id="lastName" name="lastName" type="text"
                                value={createForm.values.lastName}
                                onChange={createForm.handleChange}
                                onBlur={createForm.handleBlur}
                                aria-invalid={!!createForm.errors.lastName}
                                aria-describedby={createForm.errors.lastName ? 'lastName-error' : undefined}
                                className={inputClass(!!createForm.errors.lastName)}
                                placeholder="Last name"
                            />
                        </FormField>

                        <FormField id="email" name="email" label={t('auth.email')} required error={createForm.errors.email}>
                            <input
                                id="email" name="email" type="email"
                                value={createForm.values.email}
                                onChange={createForm.handleChange}
                                onBlur={createForm.handleBlur}
                                aria-invalid={!!createForm.errors.email}
                                aria-describedby={createForm.errors.email ? 'email-error' : undefined}
                                className={inputClass(!!createForm.errors.email)}
                                placeholder="employee@nopressure.com"
                            />
                        </FormField>

                        <FormField id="password" name="password" label={t('auth.password')} required error={createForm.errors.password}>
                            <PasswordInput
                                id="password" name="password"
                                value={createForm.values.password}
                                onChange={createForm.handleChange}
                                onBlur={createForm.handleBlur}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                aria-invalid={!!createForm.errors.password}
                                aria-describedby={createForm.errors.password ? 'password-error' : undefined}
                                className={inputClass(!!createForm.errors.password)}
                            />
                        </FormField>

                        <div className="md:col-span-2">
                            <FormField id="role" name="role" label={t('admin.role')} required error={createForm.errors.role} hint={t('admin.roleHint')}>
                                <select
                                    id="role" name="role"
                                    value={createForm.values.role}
                                    onChange={createForm.handleChange}
                                    onBlur={createForm.handleBlur}
                                    className={inputClass(!!createForm.errors.role)}
                                >
                                    <option value={ROLES.EMPLOYEE}>Employee</option>
                                    <option value={ROLES.ADMIN}>Admin</option>
                                </select>
                            </FormField>
                        </div>

                        <div className="md:col-span-2 flex gap-3 [&>button]:flex-1">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {t('common.create')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); createForm.reset(EMPTY_CREATE); }}
                                className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                {t('admin.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit form */}
            {showEditForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.edit')}
                    </h2>
                    <form onSubmit={handleUpdate} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="edit-firstName" name="firstName" label={t('auth.firstName')} required error={editForm.errors.firstName}>
                            <input
                                id="edit-firstName" name="firstName" type="text"
                                value={editForm.values.firstName}
                                onChange={editForm.handleChange}
                                onBlur={editForm.handleBlur}
                                aria-invalid={!!editForm.errors.firstName}
                                aria-describedby={editForm.errors.firstName ? 'edit-firstName-error' : undefined}
                                className={inputClass(!!editForm.errors.firstName)}
                            />
                        </FormField>

                        <FormField id="edit-lastName" name="lastName" label={t('auth.lastName')} required error={editForm.errors.lastName}>
                            <input
                                id="edit-lastName" name="lastName" type="text"
                                value={editForm.values.lastName}
                                onChange={editForm.handleChange}
                                onBlur={editForm.handleBlur}
                                aria-invalid={!!editForm.errors.lastName}
                                aria-describedby={editForm.errors.lastName ? 'edit-lastName-error' : undefined}
                                className={inputClass(!!editForm.errors.lastName)}
                            />
                        </FormField>

                        <FormField id="edit-email" name="email" label={t('auth.email')} required error={editForm.errors.email}>
                            <input
                                id="edit-email" name="email" type="email"
                                value={editForm.values.email}
                                onChange={editForm.handleChange}
                                onBlur={editForm.handleBlur}
                                aria-invalid={!!editForm.errors.email}
                                aria-describedby={editForm.errors.email ? 'edit-email-error' : undefined}
                                className={inputClass(!!editForm.errors.email)}
                            />
                        </FormField>

                        {/* This whole page is already SUPER_ADMIN-only, but keep the check
                            cheap and explicit rather than relying only on the route guard. */}
                        {isSuperAdmin(user) && (
                            <div className="md:col-span-2">
                                <label className={labelClass} htmlFor="edit-role">{t('admin.role')}</label>
                                <select
                                    id="edit-role"
                                    name="role"
                                    value={editForm.values.role}
                                    disabled={isSelfEditing}
                                    onChange={(e) => editForm.setFieldValue('role', e.target.value)}
                                    className={`${inputClass(false)} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
                                >
                                    <option value={ROLES.EMPLOYEE}>Employee</option>
                                    <option value={ROLES.ADMIN}>Admin</option>
                                    <option value={ROLES.SUPER_ADMIN}>Super admin</option>
                                </select>

                                {isSelfEditing ? (
                                    <p className="mt-2 text-xs text-gray-500">{t('admin.cannotChangeOwnRole')}</p>
                                ) : (
                                    <>
                                        {editForm.values.role === ROLES.EMPLOYEE && (
                                            <p className="mt-2 text-xs text-gray-500">{t('admin.roleDescEmployee')}</p>
                                        )}
                                        {editForm.values.role === ROLES.ADMIN && (
                                            <p className="mt-2 text-xs text-gray-500">{t('admin.roleDescAdmin')}</p>
                                        )}
                                        {editForm.values.role === ROLES.SUPER_ADMIN && (
                                            <p className="mt-2 text-xs font-medium text-amber-700">{t('admin.roleDescSuperAdmin')}</p>
                                        )}
                                    </>
                                )}

                                {!isSelfEditing && editForm.values.role === ROLES.SUPER_ADMIN && editingEmployee.role !== ROLES.SUPER_ADMIN && (
                                    <p className="mt-2 text-xs text-gray-500 bg-amber-50 border border-amber-200 px-3 py-2">
                                        {t('admin.handoverHint')}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="md:col-span-2 flex gap-3 [&>button]:flex-1">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {t('common.update')}
                            </button>
                            <button
                                type="button"
                                onClick={closeEditForm}
                                className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                {t('admin.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Handover confirmation — only reached from a form submit, never from the select itself */}
            {handoverTarget && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-md w-full p-6 border border-gray-200">
                        <h3 className="text-sm font-black uppercase tracking-wide text-black mb-3">
                            {t('admin.handoverModalTitle')}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('admin.handoverModalBody', {
                                name: `${handoverTarget.firstName} ${handoverTarget.lastName}`.trim(),
                                email: handoverTarget.email,
                            })}
                        </p>
                        <label className={labelClass} htmlFor="handover-confirm">
                            {t('admin.handoverConfirmLabel', { text: HANDOVER_CONFIRM_TEXT })}
                        </label>
                        <input
                            id="handover-confirm"
                            type="text"
                            value={handoverInput}
                            onChange={(e) => setHandoverInput(e.target.value)}
                            className={inputClass(false)}
                            autoFocus
                        />
                        <div className="flex gap-3 mt-6 [&>button]:flex-1">
                            <button
                                type="button"
                                onClick={() => { setHandoverTarget(null); setHandoverInput(''); }}
                                className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={confirmHandover}
                                disabled={handoverInput.trim() !== HANDOVER_CONFIRM_TEXT}
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employees table */}
            {loading ? (
                <LoadingSpinner height="h-32" />
            ) : (
                <ResponsiveTable
                    rows={employees}
                    rowKey={(e) => e.id}
                    emptyMessage={t('admin.noEmployees')}
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    cellClassName="px-3 py-3"
                    columns={[
                        {
                            key: 'name',
                            label: t('product.name'),
                            primary: true,
                            render: (e) => (
                                <span className="text-sm font-semibold text-black">
                                    {e.firstName} {e.lastName}
                                </span>
                            ),
                        },
                        {
                            key: 'email',
                            label: t('auth.email'),
                            render: (e) => <span className="text-sm text-gray-500 break-all">{e.email}</span>,
                        },
                        {
                            key: 'role',
                            label: t('admin.role'),
                            render: (e) => roleBadge(e.role),
                        },
                        {
                            key: 'status',
                            label: t('order.status'),
                            render: (e) => <StatusBadge active={e.active} />,
                        },
                    ]}
                    actions={(e) => {
                        const isSelf = e.id === user?.id;
                        const lastSuperAdmin = isLastSuperAdmin(e);
                        return (
                            <>
                                <button
                                    onClick={() => handleEdit(e)}
                                    className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                >
                                    {t('admin.edit')}
                                </button>
                                {!isSelf && (
                                    <button
                                        onClick={() => handleToggle(e)}
                                        disabled={lastSuperAdmin}
                                        title={lastSuperAdmin ? t('admin.mustKeepOneSuperAdmin') : undefined}
                                        className="text-xs text-gray-500 hover:text-black transition-colors underline disabled:no-underline disabled:text-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {e.active ? t('admin.deactivate') : t('admin.activate')}
                                    </button>
                                )}
                                {!isSelf && (
                                    <button
                                        onClick={() => handleDelete(e.id)}
                                        disabled={lastSuperAdmin}
                                        title={lastSuperAdmin ? t('admin.mustKeepOneSuperAdmin') : undefined}
                                        className="text-xs text-red-400 hover:text-red-600 transition-colors underline disabled:no-underline disabled:text-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {t('admin.delete')}
                                    </button>
                                )}
                            </>
                        );
                    }}
                />
            )}
        </div>
    );
};

export default AdminEmployees;
