import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthEntryLayoutProps {
    title: string;
    description: string;
    size?: 'login' | 'register';
}

export default function AuthEntryLayout({ children, title, description, size = 'login' }: PropsWithChildren<AuthEntryLayoutProps>) {
    return (
        <main className="bg-auth-canvas relative isolate flex min-h-svh flex-col items-center overflow-hidden px-4 py-10 sm:justify-center sm:py-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="auth-page-blob auth-page-blob--left" />
                <div className="auth-page-blob auth-page-blob--right" />
                <div className="auth-page-blob auth-page-blob--gold" />
            </div>

            <div className="relative z-10 flex w-full flex-col items-center">
                <Link
                    href={route('home')}
                    aria-label="AccountingChoice - Beranda"
                    className="focus-visible:outline-brand-primary mb-5 inline-flex items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                    <img src="/images/accounting-choice-logo.png" alt="AccountingChoice" className="h-16 w-20 object-contain" />
                </Link>

                <section
                    aria-labelledby="auth-title"
                    className={`border-auth-border bg-auth-panel w-full rounded-2xl border px-6 py-8 shadow-sm sm:px-9 sm:py-10 ${
                        size === 'register' ? 'max-w-md' : 'max-w-sm'
                    }`}
                >
                    <header className="mb-8 text-center">
                        <h1 id="auth-title" className="font-heading text-brand-ink text-xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="mt-1.5 text-sm text-black/55">{description}</p>
                    </header>

                    {children}
                </section>
            </div>
        </main>
    );
}
