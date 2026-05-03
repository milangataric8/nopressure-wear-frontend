import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductById } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/common/Skeleton';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, setCartCount } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    const fetchProduct = async () => {
        try {
            const response = await getProductById(id);
            setProduct(response.data);
        } catch (error) {
            toast.error('Product not found, error: ' + error);
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated()) {
            toast.info('Please sign in first');
            navigate('/login');
            return;
        }
        setAddingToCart(true);
        try {
            const response = await addToCart(user.id, { productId: product.id, quantity });
            setCartCount(response.data.items.length);
            toast.success('Added to cart');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-10">
                <Skeleton className="h-4 w-24 mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <Skeleton className="aspect-square" />
                    <div className="flex flex-col justify-center space-y-4">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <button
                onClick={() => navigate('/products')}
                className="text-xs text-zinc-500 hover:text-white transition-colors mb-8 flex items-center gap-1"
            >
                ← Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-zinc-900 border border-white/10 rounded-xl h-80 flex items-center justify-center">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover rounded-xl"
                        />
                    ) : (
                        <span className="text-zinc-600 text-sm">No image</span>
                    )}
                </div>

                <div className="flex flex-col justify-center">
                    <p className="text-xs text-zinc-500 mb-2">
                        {product.categoryName || 'Uncategorized'}
                    </p>
                    <h1 className="text-2xl font-semibold text-white mb-2">
                        {product.name}
                    </h1>
                    <p className="text-xs text-zinc-600 mb-4">SKU: {product.sku}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                        {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-6">
                        <span className="text-2xl font-semibold text-white">
                            ${product.price}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            product.stockQuantity > 0
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                        }`}>
                            {product.stockQuantity > 0
                                ? `${product.stockQuantity} in stock`
                                : 'Out of stock'}
                        </span>
                    </div>

                    {product.stockQuantity > 0 && (
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xs text-zinc-500">Quantity</span>
                            <div className="flex items-center border border-white/10 rounded-md">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
                                >
                                    -
                                </button>
                                <span className="px-3 py-1.5 text-sm text-white border-x border-white/10">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                                    className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stockQuantity === 0 || addingToCart}
                        className="bg-white text-black text-sm font-medium py-2.5 hover:bg-zinc-200 transition-colors disabled:opacity-30"
                    >
                        {addingToCart ? 'Adding...' : 'Add to cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;