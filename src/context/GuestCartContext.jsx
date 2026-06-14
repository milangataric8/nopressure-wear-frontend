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

    const addToGuestCart = (product, quantity = 1) => {
        setGuestCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
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
            }];
        });
    };

    const updateGuestCartItem = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromGuestCart(productId);
            return;
        }
        setGuestCart(prev => prev.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        ));
    };

    const removeFromGuestCart = (productId) => {
        setGuestCart(prev => prev.filter(item => item.productId !== productId));
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