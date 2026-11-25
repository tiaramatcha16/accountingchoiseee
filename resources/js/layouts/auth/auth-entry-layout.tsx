import { Link } from '@inertiajs/react';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthEntryLayoutProps {
    title: string;
    description: string;
    size?: 'login' | 'register';
}

export default function AuthEntryLayout({ children, title, description, size = 'login' }: PropsWithChildren<AuthEntryLayoutProps>) {
    return (
        <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fbfbfd] via-[#f5f5f7] to-[#ffffff] px-4 py-12 sm:py-16">
            {/* Subtle Apple Ambient Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-gradient-to-b from-emerald-100/30 via-sky-50/20 to-transparent blur-3xl"
            />

            <div className="relative z-10 flex w-full flex-col items-center">
                {/* Brand Logo */}
                <Link
                    href="/"
                    aria-label="AccountingChoice"
                    className="group mb-8 inline-flex items-center gap-2.5 transition focus-visible:outline-none"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white shadow-sm transition group-hover:scale-105">
                        <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-400" />
                    </span>
                    <span className="font-heading text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                        Accounting<span className="text-emerald-700">Choice</span>
                    </span>
                </Link>

                {/* Apple Card Container */}
                <section
                    aria-labelledby="auth-title"
                    className={`w-full rounded-3xl border border-black/[0.08] bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-9 ${
                        size === 'register' ? 'max-w-md' : 'max-w-sm'
                    }`}
                >
                    <header className="mb-7 text-center">
                        <h1 id="auth-title" className="text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f]">
                            {title}
                        </h1>
                        <p className="mt-1.5 text-xs sm:text-sm text-[#86868b] leading-relaxed">
                            {description}
                        </p>
                    </header>

                    {children}
                </section>

                {/* Back to Home Link */}
                <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 transition hover:text-[#1d1d1f]"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Kembali ke Beranda</span>
                </Link>
            </div>
        </main>
    );
}
