import { router, usePage } from '@inertiajs/react';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { type CartItemData, type SharedData } from '@/types';

export type CartItem = CartItemData;

const STORAGE_KEY = 'tiara_cart_items_v2';

export interface CartItemInput {
    id: number;
    title?: string;
    category?: string;
    price?: number;
    slug?: string;
    description?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItemInput, quantity?: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    isInCart: (idOrSlug: number | string) => boolean;
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

    // Ambil item dari localStorage untuk guest atau fallback
    const [localItems, setLocalItems] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch {
            // Abaikan JSON parse error
        }
        return [];
    });

    const saveLocalItems = (next: CartItem[]) => {
        setLocalItems(next);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                // Abaikan storage error
            }
        }
    };

    // Sinkronisasi item dari guest ke backend saat user telah login
    useEffect(() => {
        if (!user) return;

        const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return;

        try {
            const pending: CartItem[] = JSON.parse(raw);
            if (!Array.isArray(pending) || pending.length === 0) return;

            const syncSequentially = async () => {
                for (const item of pending) {
                    try {
                        const xsrfCookie = document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1];

                        await fetch(route('cart.store'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                                ...(xsrfCookie ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfCookie) } : {}),
                            },
                            body: JSON.stringify({
                                product_id: item.id,
                                quantity: item.quantity || 1,
                            }),
                        });
                    } catch {
                        // Abaikan error item individual
                    }
                }
                localStorage.removeItem(STORAGE_KEY);
                setLocalItems([]);
                router.reload({ only: ['cart'] });
            };

            void syncSequentially();
        } catch {
            // Abaikan parse error
        }
    }, [user?.id]);

    // Menggabungkan backend cart items dan localItems agar UI selalu sinkron dan responsif
    const items: CartItem[] = useMemo(() => {
        if (user && cart?.items && cart.items.length > 0) {
            return cart.items;
        }
        if (user && cart?.items && cart.items.length === 0 && localItems.length > 0) {
            // Jika backend baru saja di-load tapi ada local item sementara
            return localItems;
        }
        return localItems;
    }, [user, cart?.items, localItems]);

    const cartCount: number = useMemo(() => {
        if (user && cart?.count !== undefined && cart.count > 0) {
            return cart.count;
        }
        return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }, [user, cart?.count, items]);

    const addToCart = (item: CartItemInput, quantity: number = 1) => {
        const qty = Math.max(1, quantity);

        // Update local state secara langsung (Optimistic UI)
        const existingIdx = localItems.findIndex((i) => i.id === item.id || (item.slug && i.slug === item.slug));
        let next: CartItem[];

        if (existingIdx > -1) {
            next = localItems.map((it, idx) =>
                idx === existingIdx ? { ...it, quantity: (it.quantity || 1) + qty } : it
            );
        } else {
            const newItem: CartItem = {
                id: item.id,
                title: item.title ?? 'Template Spreadsheet',
                category: item.category ?? 'Excel & Sheets',
                price: item.price ?? 0,
                slug: item.slug ?? '',
                quantity: qty,
            };
            next = [...localItems, newItem];
        }

        saveLocalItems(next);

        // Buka drawer keranjang secara instan
        setIsCartOpen(true);

        // Jika user login, kirim ke backend
        if (user) {
            router.post(
                route('cart.store'),
                { product_id: item.id, quantity: qty },
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        }
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }

        const next = localItems.map((it) => (it.id === id ? { ...it, quantity } : it));
        saveLocalItems(next);

        if (user) {
            router.patch(
                route('cart.update', id),
                { quantity },
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        }
    };

    const removeFromCart = (id: number) => {
        const next = localItems.filter((it) => it.id !== id);
        saveLocalItems(next);

        if (user) {
            router.delete(route('cart.destroy', id), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const clearCart = () => {
        saveLocalItems([]);

        if (user) {
            router.delete(route('cart.clear'), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const isInCart = (idOrSlug: number | string) => {
        return items.some(
            (i) => i.id === idOrSlug || (typeof idOrSlug === 'string' && i.slug === idOrSlug)
        );
    };

    const getItemQuantity = (id: number) => {
        return items.find((i) => i.id === id)?.quantity ?? 0;
    };

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    }, [items]);

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
