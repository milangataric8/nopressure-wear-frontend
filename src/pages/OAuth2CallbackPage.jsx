import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCart } from '../api/cartApi';

const OAuth2CallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginUser, setCartCount } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const id = searchParams.get('id');
        const email = searchParams.get('email');
        const role = searchParams.get('role');
        const firstName = searchParams.get('firstName');
        const lastName = searchParams.get('lastName');

        if (token && id) {
            loginUser({ id: parseInt(id), email, role, firstName, lastName }, token);

            getCart(parseInt(id))
                .then(response => setCartCount(response.data.items.length))
                .catch(() => {});

            navigate('/');
        } else {
            navigate('/login');
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
        </div>
    );
};

export default OAuth2CallbackPage;