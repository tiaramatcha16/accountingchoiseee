import type { PropsWithChildren } from 'react';

import CartDrawer from '@/components/landing-page/CartDrawer';
import FloatingActions from '@/components/landing-page/FloatingActions';
import Footer from '@/components/landing-page/Footer';
import Navbar from '@/components/landing-page/Navbar';
import { CartProvider } from '@/hooks/use-cart';

export default function StorefrontLayout({ children }: PropsWithChildren) {
    return (
        <CartProvider>
            <div className="landing-page bg-brand-canvas text-brand-ink selection:bg-brand-primary relative min-h-screen w-full antialiased selection:text-white">
                <Navbar />
                {children}
                <Footer />
                <CartDrawer />
                <FloatingActions />
            </div>
        </CartProvider>
    );
}
