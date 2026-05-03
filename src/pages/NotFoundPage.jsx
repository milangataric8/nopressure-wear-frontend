import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Error 404
            </p>
            <h1 className="text-8xl font-black uppercase tracking-tight text-black mb-6">
                Not Found
            </h1>
            <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">
                The page you are looking for does not exist or has been moved.
            </p>
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="border border-black text-black text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-50 transition-colors"
                >
                    Go Back
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-8 py-3 hover:bg-gray-800 transition-colors"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;