import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, FileSpreadsheet, LogOut, Menu, MessageCircle, Package, Search, Shield, ShoppingBag, Store, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

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
    { label: 'Fitur', href: '/#fitur' },
    { label: 'Katalog', href: '/#template-list' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Testimoni', href: '/#testimoni' },
    { label: 'FAQ', href: '/#faq' },
];

export default function Navbar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const { cartCount, setIsCartOpen } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('/#') || href.startsWith('#')) {
            const targetId = href.replace(/^\/?#/, '');
            const targetElement = document.getElementById(targetId);
            
            // If we are on the homepage or the element exists in current DOM
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', `#${targetId}`);
                setIsMobileMenuOpen(false);
            }
        }
    };

    useEffect(() => {
        const updateScrollState = () => setIsScrolled(window.scrollY > 20);
        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });
        return () => window.removeEventListener('scroll', updateScrollState);
    }, []);

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
            className="flex h-9 w-full items-center gap-2 rounded-full bg-slate-100/80 px-3.5 text-slate-900 border border-transparent focus-within:border-slate-300 focus-within:bg-white transition"
        >
            <Search aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
                type="search"
                aria-label="Cari template Excel"
                placeholder="Cari template..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-slate-400 focus:ring-0"
            />
            <button type="submit" className="sr-only">
                Cari
            </button>
        </form>
    );

    return (
        <header className="fixed top-0 inset-x-0 z-50 p-3 sm:p-4 pointer-events-none">
            <div
                className={`pointer-events-auto mx-auto max-w-7xl rounded-full border transition-all duration-300 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 ${
                    isScrolled
                        ? 'border-slate-200/90 bg-white/90 shadow-lg shadow-black/5 backdrop-blur-xl'
                        : 'border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-md'
                }`}
            >
                {/* Brand Logo */}
                <Link href="/" aria-label="AccountingChoice" className="flex shrink-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1d1d1f] text-white shadow-xs">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    </span>
                    <span className="text-base sm:text-lg font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                        Accounting<span className="text-emerald-700">Choice</span>
                    </span>
                </Link>

                {/* Center Nav Links */}
                <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#86868b] transition hover:bg-neutral-100 hover:text-[#1d1d1f]"
                        >
                            {item.label}
                        </Link>
                    ))}
                    {sellerHref && (
                        <Link
                            href={sellerHref}
                            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#86868b] transition hover:bg-neutral-100 hover:text-[#1d1d1f]"
                        >
                            {sellerLabel}
                        </Link>
                    )}
                </nav>

                {/* Search in Desktop */}
                <div className="hidden md:block w-48 xl:w-60">{searchForm}</div>

                {/* Right Actions: Cart & Auth */}
                <div className="flex shrink-0 items-center gap-2">
                    {user && user.role !== 'admin' && (
                        <button
                            type="button"
                            aria-label={`Buka keranjang, ${cartCount} unit`}
                            onClick={() => setIsCartOpen(true)}
                            className="relative inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                        >
                            <ShoppingBag className="h-4 w-4 text-emerald-700" />
                            <span className="hidden sm:inline">Keranjang</span>
                            {cartCount > 0 && (
                                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-black text-white">
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
                                    className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white py-1 pr-3 pl-1.5 text-xs font-semibold text-[#1d1d1f] transition hover:bg-neutral-50 shadow-2xs"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-[10px] font-bold text-white uppercase">
                                        {user.name.charAt(0)}
                                    </span>
                                    <span className="max-w-[100px] truncate">{user.name}</span>
                                    <ChevronDown className="h-3 w-3 text-[#86868b]" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-xl">
                                <DropdownMenuLabel className="px-3 py-2 text-xs">
                                    <p className="text-sm font-semibold text-[#1d1d1f]">{user.name}</p>
                                    <p className="truncate text-[11px] text-[#86868b]">{user.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-xs font-medium">
                                    <Link href="/my-orders" className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-emerald-700" />
                                        <span>Pesanan Saya</span>
                                    </Link>
                                </DropdownMenuItem>
                                {user.role !== 'admin' && (
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-xs font-medium">
                                        <Link href="/chat" className="flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4 text-emerald-700" />
                                            <span>Chat Admin</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {user.role === 'admin' && (
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-xs font-medium">
                                        <Link href="/admin" className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-emerald-700" />
                                            <span>Dashboard Admin</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 text-xs font-medium text-rose-600 focus:text-rose-600">
                                    <Link href="/logout" method="post" as="button" className="flex w-full items-center gap-2">
                                        <LogOut className="h-4 w-4" />
                                        <span>Keluar</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link
                                href="/login"
                                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] transition hover:bg-neutral-100"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-[#333336] active:scale-95"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu navigasi'}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex lg:hidden h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                    >
                        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="pointer-events-auto mx-auto mt-2 max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl lg:hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="mb-4">{searchForm}</div>
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                            >
                                {item.label}
                            </Link>
                        ))}

                        {!user && (
                            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex-1 text-center rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-800"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex-1 text-center rounded-xl bg-[#1d1d1f] py-2.5 text-xs font-semibold text-white shadow-xs"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
