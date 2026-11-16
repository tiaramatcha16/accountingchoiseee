import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, Menu, MessageCircle, Package, Search, Shield, ShoppingBag, Store, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/hooks/use-cart';
import { type SharedData } from '@/types';

const navigation = [
    { label: 'Beranda', href: '/#hero' },
    { label: 'Kategori', href: '/#pilih-kebutuhan' },
    { label: 'Katalog', href: '/#template-list' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
];

export default function Navbar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const { cartCount, setIsCartOpen } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sellerHref = user?.role === 'seller' ? '/seller/products' : user?.role === 'admin' ? '/admin/products' : null;
    const sellerLabel = user?.role === 'seller' ? 'Toko Saya' : 'Kelola Toko';

    function search(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const query = searchQuery.trim();
        router.get(route('catalog.index'), query ? { q: query } : {});
        setIsMobileMenuOpen(false);
    }

    const searchForm = (
        <form
            onSubmit={search}
            role="search"
            className="bg-brand-surface text-brand-ink focus-within:ring-brand-primary/30 flex h-10 w-full items-center gap-2 rounded-full px-4 ring-1 ring-black/[0.04] focus-within:ring-2"
        >
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-black/45" />
            <input
                type="search"
                aria-label="Cari template Excel"
                placeholder="Cari template Excel..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-black/45 focus:ring-0"
            />
            <button type="submit" className="sr-only">
                Cari
            </button>
        </form>
    );

    return (
        <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-white/95 shadow-2xs backdrop-blur-md">
            <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                <Link href="/" aria-label="AccountingChoice, beranda" className="group flex shrink-0 items-center gap-2.5">
                    <img
                        src="/images/accounting-choice-logo.png"
                        alt=""
                        className="h-10 w-11 object-contain transition-transform group-hover:scale-105"
                    />
                    <span className="flex flex-col">
                        <span className="font-heading text-brand-primary flex items-center text-lg leading-none font-bold tracking-tight sm:text-xl">
                            Accounting<span className="text-brand-gold">Choice</span>
                        </span>
                        <span className="mt-1 text-[9px] font-bold tracking-wider text-black/45 uppercase">Pasar Template Excel</span>
                    </span>
                </Link>

                <nav aria-label="Navigasi utama" className="hidden shrink-0 items-center gap-1 xl:flex">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="hover:bg-brand-surface hover:text-brand-primary rounded-full px-3 py-2 text-[13px] font-semibold text-black/65 transition"
                        >
                            {item.label}
                        </Link>
                    ))}
                    {sellerHref && (
                        <Link
                            href={sellerHref}
                            className="hover:bg-brand-surface hover:text-brand-primary rounded-full px-3 py-2 text-[13px] font-semibold text-black/65 transition"
                        >
                            {sellerLabel}
                        </Link>
                    )}
                </nav>

                <div className="hidden min-w-0 flex-1 lg:block lg:max-w-xs xl:ml-auto">{searchForm}</div>

                <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
                    {user && user.role !== 'admin' && (
                        <button
                            type="button"
                            aria-label={`Buka keranjang, ${cartCount} item`}
                            onClick={() => setIsCartOpen(true)}
                            className="hover:bg-brand-surface relative inline-flex h-10 items-center justify-center gap-2 rounded-full p-2.5 text-black transition sm:px-3"
                        >
                            <ShoppingBag className="text-brand-primary h-5 w-5" />
                            <span className="hidden text-xs font-bold sm:inline">Keranjang</span>
                            {cartCount > 0 && (
                                <span className="bg-brand-primary absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="hover:bg-brand-surface flex max-w-[150px] items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-1.5 text-xs font-bold text-black transition sm:px-3"
                                >
                                    <span className="bg-brand-primary/10 text-brand-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold uppercase">
                                        {user.name.charAt(0)}
                                    </span>
                                    <span className="hidden truncate sm:inline">{user.name}</span>
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-black/40" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-black/10 bg-white p-1.5 shadow-lg">
                                <DropdownMenuLabel className="px-3 py-2 text-xs text-black/55">
                                    <p className="text-sm font-bold text-black">{user.name}</p>
                                    <p className="truncate text-[11px] text-black/50">{user.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold">
                                    <Link href="/my-orders" className="flex items-center gap-2">
                                        <Package className="text-brand-primary h-4 w-4" />
                                        <span>Pesanan Saya</span>
                                    </Link>
                                </DropdownMenuItem>
                                {user.role !== 'admin' && (
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold">
                                        <Link href="/chat" className="flex items-center gap-2">
                                            <MessageCircle className="text-brand-primary h-4 w-4" />
                                            <span>Chat Admin</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {user.role === 'seller' && (
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold">
                                        <Link href="/seller/products" className="flex items-center gap-2">
                                            <Store className="text-brand-primary h-4 w-4" />
                                            <span>Kelola Template Saya</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {user.role === 'admin' && (
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold">
                                        <Link href="/admin" className="flex items-center gap-2">
                                            <Shield className="text-brand-gold-dark h-4 w-4" />
                                            <span>Panel Admin</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.post(route('logout'))}
                                    className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-red-600 focus:bg-red-50 focus:text-red-700"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link
                                href={route('login')}
                                className="hover:bg-brand-surface rounded-full px-3.5 py-2 text-xs font-bold text-black transition"
                            >
                                Masuk
                            </Link>
                            <Link
                                href={route('register')}
                                className="border-brand-primary bg-brand-primary hover:bg-brand-primary-dark rounded-full border px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-storefront-menu"
                        onClick={() => setIsMobileMenuOpen((open) => !open)}
                        className="hover:bg-brand-surface inline-flex h-10 w-10 items-center justify-center rounded-full text-black transition xl:hidden"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div id="mobile-storefront-menu" className="border-t border-black/[0.07] bg-white px-4 py-4 shadow-lg xl:hidden">
                    <div className="mx-auto max-w-7xl space-y-4 sm:px-2">
                        <div className="lg:hidden">{searchForm}</div>
                        <nav aria-label="Navigasi seluler" className="grid gap-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:bg-brand-surface hover:text-brand-primary rounded-xl px-3 py-2.5 text-sm font-semibold text-black/75 transition"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {sellerHref && (
                                <Link
                                    href={sellerHref}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-brand-primary hover:bg-brand-primary/5 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
                                >
                                    {sellerLabel}
                                </Link>
                            )}
                            {!user && (
                                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-black/[0.07] pt-3 sm:hidden">
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl border border-black/10 px-3 py-2.5 text-center text-sm font-bold text-black"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-brand-primary rounded-xl px-3 py-2.5 text-center text-sm font-bold text-white"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                            {user && user.role !== 'admin' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsCartOpen(true);
                                    }}
                                    className="bg-brand-primary/5 text-brand-primary mt-2 flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold"
                                >
                                    <span>Keranjang</span>
                                    <span>{cartCount} item</span>
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}
