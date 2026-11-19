import { router, usePage } from '@inertiajs/react';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { type CartItemData, type SharedData } from '@/types';

export type CartItem = CartItemData;

interface CartContextType {
    items: CartItem[];
    addToCart: (item: { id: number; title?: string }, quantity?: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    isInCart: (id: number) => boolean;
    getItemQuantity: (id: number) => number;
    totalAmount: number;
    cartCount: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { auth, cart } = usePage<SharedData>().props;
    const user = auth?.user;
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Clean up any legacy localStorage carts from previous versions
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('accounting_choice_cart_v1');
            } catch {
                // Ignore storage errors
            }
        }
    }, []);

    const items: CartItem[] = cart?.items ?? [];
    const cartCount: number = cart?.count ?? items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const addToCart = (item: { id: number; title?: string }, quantity: number = 1) => {
        if (!user) {
            router.visit(route('login'));
            return;
        }

        router.post(
            route('cart.store'),
            { product_id: item.id, quantity },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCartOpen(true);
                },
            }
        );
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (!user) return;
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }

        router.patch(
            route('cart.update', id),
            { quantity },
            {
                preserveScroll: true,
            }
        );
    };

    const removeFromCart = (id: number) => {
        if (!user) return;

        router.delete(route('cart.destroy', id), {
            preserveScroll: true,
        });
    };

    const clearCart = () => {
        if (!user) return;

        router.delete(route('cart.clear'), {
            preserveScroll: true,
        });
    };

    const isInCart = (id: number) => items.some((i) => i.id === id);

    const getItemQuantity = (id: number) => items.find((i) => i.id === id)?.quantity ?? 0;

    const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                isInCart,
                getItemQuantity,
                totalAmount,
                cartCount,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
