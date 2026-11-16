import { Head } from '@inertiajs/react';

import StorefrontLayout from '@/layouts/storefront-layout';
import Catalog, { type TemplateItem } from './sections/Catalog';
import Categories from './sections/Categories';
import Faq from './sections/Faq';
import Hero from './sections/Hero';
import HowItWorks from './sections/HowItWorks';

interface LandingPageProps {
    products?: TemplateItem[];
}

export default function LandingPage({ products }: LandingPageProps) {
    return (
        <StorefrontLayout>
            <Head title="Pasar Template Excel & Keuangan">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700;1,800;1,900&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <main>
                <Hero />
                <Categories />
                <Catalog initialProducts={products} />
                <section id="cara-kerja" className="relative py-14 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                            <HowItWorks />
                            <Faq />
                        </div>
                    </div>
                </section>
            </main>
        </StorefrontLayout>
    );
}
