import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance'
import {getEmployees} from "../../api/employeeApi.js";

const AdminEmployees = () => {
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
            toast.error('Failed to load employees, error: ' + e.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchEmployees();
    },[page, searchQuery, activeFilter]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/employees', formData);
            toast.success('Employee created');
            setShowForm(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'EMPLOYEE',
            });
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create employee');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this employee?')) return;
        try {
            await axiosInstance.delete(`/employees/${id}`);
            toast.success('Employee deleted');
            fetchEmployees();
        } catch (e) {
            toast.error('Failed to delete employee, error: ' + e.message || 'Unknown error');
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
            toast.error('Failed to update employee status, error: ' + e.message || 'Unknown error');
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
            toast.success('Employee updated');
            setShowEditForm(false);
            setEditingEmployee(null);
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update employee');
        }
    };

    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        Employees
                    </h1>
                    <p className="text-sm text-gray-500">Manage store employees</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) {
                            setShowForm(false);
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Employee'}
                </button>
            </div>

            {!showForm && (
                <div className="flex items-center justify-between mb-6 gap-4">
                    {/* Active/Inactive filter — left 50% */}
                    <div className="flex w-1/2">
                        <button
                            onClick={() => { setActiveFilter(prev => prev === true ? null : true); setPage(0); }}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                                activeFilter === true
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-500 border-gray-300 hover:border-green-600 hover:text-green-600'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => { setActiveFilter(activeFilter === false ? null : false); setPage(0); }}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide border-t border-b border-r transition-colors ${
                                activeFilter === false
                                    ? 'bg-red-500 text-white border-red-500'
                                    : 'bg-white text-gray-500 border-gray-300 hover:border-red-500 hover:text-red-500'
                            }`}
                        >
                            Inactive
                        </button>
                    </div>

                    {/* Search — right 50% */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(0); }}
                        className="flex w-1/2"
                    >
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search products by name or email..."
                            className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                        <button
                            type="submit"
                            className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                        >
                            Search
                        </button>
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(0); }}
                                className="border border-gray-300 text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                ×
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        New Employee
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>First Name</label>
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
                            <label className={labelClass}>Last Name</label>
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
                            <label className={labelClass}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="employee@webshop.com"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Password</label>
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

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                Create Employee
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit form */}
            {showEditForm && (
                <div className="border border-gray-200 p-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        Edit Employee
                    </h2>
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>First Name</label>
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
                            <label className={labelClass}>Last Name</label>
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
                            <label className={labelClass}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>New Password</label>
                            <input
                                type="password"
                                name="password"
                                value={editFormData.password}
                                onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                                className={inputClass}
                                placeholder="Leave blank to keep current"
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-800 transition-colors"
                            >
                                Update Employee
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowEditForm(false); setEditingEmployee(null); }}
                                className="border border-gray-300 text-black text-sm font-semibold uppercase tracking-wide px-8 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Employees table */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
            ) : employees.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">No employees yet</p>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Name</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Email</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Status</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {employees.map(employee => (
                            <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-sm font-semibold text-black">
                                        {employee.firstName} {employee.lastName}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {employee.email}
                                </td>
                                <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold uppercase px-2 py-1 ${
                                            employee.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {employee.active ? 'Active' : 'Inactive'}
                                        </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleEdit(employee)}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggle(employee)}
                                            className="text-xs text-gray-500 hover:text-black transition-colors underline"
                                        >
                                            {employee.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee.id)}
                                            className="text-xs text-red-400 hover:text-red-600 transition-colors underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-200">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="text-sm font-medium px-4 py-1.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="text-sm font-medium px-4 py-1.5 border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminEmployees;