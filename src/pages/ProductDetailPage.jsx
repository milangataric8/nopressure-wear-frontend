import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductById } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/common/Skeleton';
import {getImageUrl} from "../utils/imageUtils.js";

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
                {/* Image */}
                <div className="bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                        <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain p-4"
                        />
                    ) : (
                        <span className="text-gray-400 text-sm">No image available</span>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                        {product.categoryName || 'Uncategorized'}
                    </p>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                        {product.name}
                    </h1>
                    {/* Sakrij SKU ili preimenuj */}
                    <p className="text-xs text-gray-400 mb-6">Product Code: {product.sku}</p>

                    <p className="text-sm text-gray-600 leading-relaxed mb-8">
                        {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                        <span className="text-2xl font-bold text-black">
                            ${product.price}
                        </span>
                                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                                            product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'
                                        }`}>
                            {product.stockQuantity > 0
                                ? `${product.stockQuantity} in stock`
                                : 'Sold Out'}
                        </span>
                    </div>

                    {product.stockQuantity > 0 && (
                        <div className="flex items-center gap-6 mb-6">
                            <span className="text-xs font-semibold uppercase tracking-wide text-black">
                                Quantity
                            </span>
                            <div className="flex items-center border border-gray-300">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors text-lg"
                                >
                                −
                                </button>
                                <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-black border-x border-gray-300">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors text-lg"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stockQuantity === 0 || addingToCart}
                        className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-4 hover:bg-gray-800 transition-colors disabled:opacity-30"
                    >
                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;