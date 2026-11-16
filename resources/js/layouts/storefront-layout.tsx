import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

import CartDrawer from '@/components/landing-page/CartDrawer';
import FloatingActions from '@/components/landing-page/FloatingActions';
import Footer from '@/components/landing-page/Footer';
import Navbar from '@/components/landing-page/Navbar';
import { CartProvider } from '@/hooks/use-cart';

export default function StorefrontLayout({ children }: PropsWithChildren) {
    return (
        <CartProvider>
            <div className="landing-page bg-brand-canvas text-brand-ink selection:bg-brand-primary relative min-h-screen w-full overflow-x-clip antialiased selection:text-white">
                <div className="bg-brand-deep px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
                    <span>Template Excel praktis untuk usaha dan pengelolaan keuangan.</span>{' '}
                    <Link href="/#template-list" className="text-brand-gold ml-1 font-bold underline underline-offset-2">
                        Jelajahi katalog
                    </Link>
                </div>
                <Navbar />
                {children}
                <Footer />
                <CartDrawer />
                <FloatingActions />
            </div>
        </CartProvider>
    );
}
