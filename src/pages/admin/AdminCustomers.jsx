import axiosInstance from '../../api/axiosInstance';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import AdminSearchFilter from "./AdminSearchFilter.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import ResponsiveTable from "../../components/admin/ResponsiveTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useTranslation } from 'react-i18next';

const AdminCustomers = () => {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'sr' ? 'sr-RS' : 'en-US';
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
            toast.error(e.response?.data?.message || t('messages.failedToLoad'));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void fetchCustomers();
    }, [page, searchQuery, activeFilter]);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                        {t('admin.customers')}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {t('admin.customersTotal', { count: totalElements })}
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
                searchPlaceholder={t('admin.searchCustomers')}
            />

            {/* Table */}
            {loading ? (
                <LoadingSpinner height="h-32" />
            ) : (
                <ResponsiveTable
                    rows={customers}
                    rowKey={(c) => c.id}
                    onRowClick={(c) => navigate(`/admin/customers/${c.id}`)}
                    emptyMessage={t('admin.noCustomers')}
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    columns={[
                        {
                            key: 'name',
                            label: t('product.name'),
                            primary: true,
                            render: (c) => (
                                <span className="text-sm font-semibold text-black">
                                    {c.firstName} {c.lastName}
                                </span>
                            ),
                        },
                        {
                            key: 'email',
                            label: t('auth.email'),
                            render: (c) => <span className="text-sm text-gray-500 break-all">{c.email}</span>,
                        },
                        {
                            key: 'joined',
                            label: t('admin.joined'),
                            render: (c) => (
                                <span className="text-gray-500">
                                    {new Date(c.createdAt).toLocaleDateString(dateLocale, {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                </span>
                            ),
                        },
                        {
                            key: 'status',
                            label: t('order.status'),
                            render: (c) => <StatusBadge active={c.active} />,
                        },
                    ]}
                />
            )}
        </div>
    );
};

export default AdminCustomers;