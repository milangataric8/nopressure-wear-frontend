import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance'
import {getEmployees} from "../../api/employeeApi.js";
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import ResponsiveTable from "../../components/admin/ResponsiveTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useTranslation } from 'react-i18next';

const AdminEmployees = () => {
    const { t } = useTranslation();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
    });
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
    });
    const [showEditForm, setShowEditForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeFilter, setActiveFilter] = useState(null);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/employees', formData);
            toast.success(t('messages.employeeCreated'));
            setShowForm(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'EMPLOYEE',
            });
            await fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || t('messages.failedToSave'));
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
        setEditFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            password: '',
            role: 'EMPLOYEE',
        });
        setShowEditForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/employees/${editingEmployee.id}`, editFormData);
            toast.success(t('messages.employeeUpdated'));
            setShowEditForm(false);
            setEditingEmployee(null);
            await fetchEmployees();
        } catch (e) {
            toast.error(e.response?.data?.message || t('messages.failedToSave'));
        }
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

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

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        {t('admin.newEmployee')}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('auth.firstName')}</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="First name"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('auth.lastName')}</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Last name"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('auth.email')}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="employee@nopressure.com"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('auth.password')}</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="••••••••"
                                required
                            />
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
                                onClick={() => setShowForm(false)}
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
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>{t('auth.firstName')}</label>
                            <input
                                type="text"
                                name="firstName"
                                value={editFormData.firstName}
                                onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('auth.lastName')}</label>
                            <input
                                type="text"
                                name="lastName"
                                value={editFormData.lastName}
                                onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{t('auth.email')}</label>
                            <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3 [&>button]:flex-1">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                {t('common.update')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowEditForm(false); setEditingEmployee(null); }}
                                className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                {t('admin.cancel')}
                            </button>
                        </div>
                    </form>
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
                            key: 'status',
                            label: t('order.status'),
                            render: (e) => <StatusBadge active={e.active} />,
                        },
                    ]}
                    actions={(e) => (
                        <>
                            <button
                                onClick={() => handleEdit(e)}
                                className="text-xs text-gray-500 hover:text-black transition-colors underline"
                            >
                                {t('admin.edit')}
                            </button>
                            <button
                                onClick={() => handleToggle(e)}
                                className="text-xs text-gray-500 hover:text-black transition-colors underline"
                            >
                                {e.active ? t('admin.deactivate') : t('admin.activate')}
                            </button>
                            <button
                                onClick={() => handleDelete(e.id)}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                            >
                                {t('admin.delete')}
                            </button>
                        </>
                    )}
                />
            )}
        </div>
    );
};

export default AdminEmployees;