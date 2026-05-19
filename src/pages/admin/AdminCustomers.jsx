import axiosInstance from '../../api/axiosInstance';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const AdminCustomers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };

            if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery;
            if (activeFilter !== null) params.active = activeFilter;

            const response = await axiosInstance.get('/users/customers', { params });

            setCustomers(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchCustomers();
    }, [page, searchQuery, activeFilter]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        Customers
                    </h1>
                    <p className="text-sm text-gray-500">
                        {totalElements} customer{totalElements !== 1 ? 's' : ''} total
                    </p>
                </div>
            </div>

            <AdminSearchFilter
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                setPage={setPage}
                searchPlaceholder="Search products by name or SKU..."
            />

            {/* Table */}
            {loading && <LoadingSpinner />}
            {
                loading && <LoadingSpinner height="h-32" />
            }
            { customers.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-sm">No customers found</p>
                </div>
            ) : (
                <div className="border border-gray-200">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Name</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Email</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Joined</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {customers.map(customer => (
                            <tr
                                key={customer.id}
                                onClick={() => navigate(`/admin/customers/${customer.id}`)}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-4 py-3">
                                    <p className="text-sm font-semibold text-black">
                                        {customer.firstName} {customer.lastName}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {customer.email}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge active={customer.active} />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;