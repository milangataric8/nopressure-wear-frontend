import axiosInstance from '../../api/axiosInstance';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

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
            toast.error('Failed to load customers, error: ' + e.message);
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

            {/* Table */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
            ) : customers.length === 0 ? (
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
                                        <span className={`text-xs font-semibold uppercase px-2 py-1 ${
                                            customer.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {customer.active ? 'Active' : 'Inactive'}
                                        </span>
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

export default AdminCustomers;