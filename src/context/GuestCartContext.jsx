import { createContext, useState, useEffect } from 'react';

export const GuestCartContext = createContext();

export const GuestCartProvider = ({ children }) => {
    const [guestCart, setGuestCart] = useState(() => {
        const saved = localStorage.getItem('guestCart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
    }, [guestCart]);

    const addToGuestCart = (product, quantity = 1, size = null) => {
        setGuestCart(prev => {
            const existing = prev.find(
                item => item.productId === product.id && item.size === size
            );
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id && item.size === size
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                discountPrice: product.discountPrice,
                imageUrl: product.imageUrl,
                quantity,
                size,
            }];
        });
    };

    const updateGuestCartItem = (productId, quantity, size = null) => {
        if (quantity <= 0) {
            removeFromGuestCart(productId, size);
            return;
        }
        setGuestCart(prev => prev.map(item =>
            item.productId === productId && item.size === size
                ? { ...item, quantity }
                : item
        ));
    };

    const removeFromGuestCart = (productId, size = null) => {
        setGuestCart(prev => prev.filter(
            item => !(item.productId === productId && item.size === size)
        ));
    };

    const clearGuestCart = () => setGuestCart([]);

    return (
        <GuestCartContext.Provider value={{
            guestCart, addToGuestCart, updateGuestCartItem,
            removeFromGuestCart, clearGuestCart
        }}>
            {children}
        </GuestCartContext.Provider>
    );
};
