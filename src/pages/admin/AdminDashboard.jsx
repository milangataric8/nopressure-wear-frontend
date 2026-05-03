import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm mb-10">Manage your store</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/admin/products"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        Products
                    </h2>
                    <p className="text-sm text-gray-500">
                        Create, edit and manage your product catalog
                    </p>
                </Link>

                <Link
                    to="/admin/orders"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        Orders
                    </h2>
                    <p className="text-sm text-gray-500">
                        View and manage customer orders
                    </p>
                </Link>

                <Link
                    to="/admin/categories"
                    className="border border-gray-200 p-8 hover:border-black transition-colors group"
                >
                    <h2 className="text-lg font-black uppercase tracking-tight text-black mb-2 group-hover:underline">
                        Categories
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage product categories
                    </p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;