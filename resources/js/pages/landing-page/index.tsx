import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

import { AppleHelloEnglishEffect } from '@/components/ui/apple-hello-effect';
import StorefrontLayout from '@/layouts/storefront-layout';
import BentoFeatures from './sections/BentoFeatures';
import Catalog, { type TemplateItem } from './sections/Catalog';
import CtaBanner from './sections/CtaBanner';
import Faq from './sections/Faq';
import Hero from './sections/Hero';
import HowItWorks from './sections/HowItWorks';
import TestimonialsSection from './sections/Testimonials';

interface LandingPageProps {
    products?: TemplateItem[];
}

export default function LandingPage({ products }: LandingPageProps) {
    const [isLoading, setIsLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            return !sessionStorage.getItem('accountingchoice_intro_shown');
        }
        return false;
    });
    const [isTransitionComplete, setIsTransitionComplete] = useState(() => {
        if (typeof window !== 'undefined') {
            return Boolean(sessionStorage.getItem('accountingchoice_intro_shown'));
        }
        return true;
    });

    // Kunci scroll body saat intro hello aktif agar TIDAK ADA SCROLLBAR sama sekali
    useEffect(() => {
        if (isLoading) {
            const originalOverflow = document.documentElement.style.overflow;
            const originalBodyOverflow = document.body.style.overflow;
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            return () => {
                document.documentElement.style.overflow = originalOverflow;
                document.body.style.overflow = originalBodyOverflow;
            };
        }
    }, [isLoading]);

    const finishLoading = useCallback(() => {
        setIsLoading(false);
        setIsTransitionComplete(true);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('accountingchoice_intro_shown', 'true');
        }
    }, []);

    const handleAnimationComplete = () => {
        // Beri jeda 550ms agar tulisan hello terlihat sempurna dan mempesona sebelum transisi 3D meledak
        setTimeout(() => {
            finishLoading();
        }, 550);
    };

    useEffect(() => {
        // Fallback keselamatan
        const fallbackTimer = setTimeout(() => {
            finishLoading();
        }, 4600);

        return () => clearTimeout(fallbackTimer);
    }, [finishLoading]);

    useEffect(() => {
        if (!isLoading && typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.replace('#', '');
            const elem = document.getElementById(hash);
            if (elem) {
                setTimeout(() => {
                    elem.scrollIntoView({ behavior: 'smooth' });
                }, 150);
            }
        }
    }, [isLoading]);

    return (
        <StorefrontLayout>
            <div className="relative min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
                <Head title="AccountingChoice - Template Akuntansi Google Sheets & Excel Otomatis" />

                {/* Apple Hello Screen Overlay dengan Efek Cinematic 3D Tunneling Portal */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            key="apple-hello-loader"
                            initial={{ opacity: 1 }}
                            exit={{
                                opacity: 0,
                                scale: 2.2,
                                rotateZ: -2,
                                filter: 'blur(20px)',
                                transition: {
                                    duration: 1.15,
                                    ease: [0.16, 1, 0.3, 1],
                                },
                            }}
                            style={{
                                transformOrigin: '50% 50%',
                                backfaceVisibility: 'hidden',
                            }}
                            className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white pointer-events-auto overflow-hidden select-none"
                        >
                            {/* Apple Radial Spotlight Ambient */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0.3 }}
                                animate={{ scale: 1.2, opacity: 0.6 }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                                aria-hidden="true"
                                className="pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-emerald-100/40 via-sky-50/30 to-amber-50/20 blur-3xl"
                            />

                            {/* Hello Text Card with floating shadow */}
                            <motion.div
                                initial={{ scale: 0.94, y: 10 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="relative flex flex-col items-center justify-center px-6"
                            >
                                <AppleHelloEnglishEffect
                                    speed={0.88}
                                    className="h-28 sm:h-40 text-[#1d1d1f] drop-shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
                                    onAnimationComplete={handleAnimationComplete}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Konten Halaman */}
                {isLoading ? (
                    <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-0" />
                ) : (
                    <div>
                        <div id="hero">
                            <Hero />
                        </div>

                        <BentoFeatures />

                        <div>
                            <Catalog initialProducts={products} />
                        </div>

                        <HowItWorks />

                        <TestimonialsSection />

                        <Faq />

                        <CtaBanner />
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
