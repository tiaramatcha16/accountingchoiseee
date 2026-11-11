import { useState } from 'react';

import { Icon } from './brand-icon';

export default function Navbar() {
    const [activeSection, setActiveSection] = useState('#hero');
    const navItemClass = (section: string) =>
        `nav-bubble-item relative rounded-lg px-3.5 py-1.5 transition-all after:absolute after:-bottom-2 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-center after:scale-x-0 after:bg-brand-primary after:transition-transform ${
            activeSection === section
                ? 'bg-brand-primary/10 font-bold text-brand-primary after:scale-x-100'
                : 'text-black/70 hover:bg-black/5 hover:text-black'
        }`;

    return (
        <>
<header className="sticky top-0 z-40 border-b border-black/[0.08] bg-white/95 shadow-2xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            
            
            <a href="/" className="flex items-center gap-2.5 shrink-0 group">
                <img
                    src="/images/accounting-choice-logo.png"
                    alt="Logo AccountingChoice"
                    className="h-10 w-12 object-contain transition-transform group-hover:scale-105"
                />
                <div className="flex flex-col">
                    <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-brand-primary leading-none flex items-center">
                        Accounting<span className="text-brand-gold">Choice</span>
                    </span>
                    <span className="text-[8.5px] uppercase font-bold tracking-wider text-black/40 mt-0.5">Template Store</span>
                </div>
            </a>

            
            <nav id="navbar-menu" className="hidden items-center gap-1 text-[13px] font-semibold text-black/70 lg:flex">
                <a href="#hero" className={navItemClass('#hero')} onClick={() => setActiveSection('#hero')}>Beranda</a>
                <a href="#pilih-kebutuhan" className={navItemClass('#pilih-kebutuhan')} onClick={() => setActiveSection('#pilih-kebutuhan')}>Kategori</a>
                <div className="relative group">
                    <button className={`${navItemClass('#template-list')} flex items-center gap-1`} onClick={() => setActiveSection('#template-list')} type="button">
                        <span>Katalog Template</span>
                        <Icon name="chevron-down" className="w-3.5 h-3.5 text-black/40 group-hover:rotate-180 transition-transform" />
                    </button>
                    
                    <div className="absolute left-0 top-full z-50 hidden w-[min(90vw,680px)] pt-3 group-hover:block">
                        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
                            <a
                                href="#template-list"
                                className="flex flex-col justify-end rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-green p-5 transition hover:from-brand-surface-green-hover hover:to-brand-surface-green-light"
                                onClick={() => setActiveSection('#template-list')}
                            >
                                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                                    <Icon name="layers" className="h-5 w-5" />
                                </span>
                                <span className="font-heading text-lg font-bold text-black">Template Keuangan</span>
                                <span className="mt-2 text-sm leading-relaxed text-black/60">
                                    Pilihan spreadsheet praktis untuk bisnis, pajak, freelancer, dan keuangan pribadi.
                                </span>
                                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-primary">
                                    Lihat semua template
                                    <Icon name="arrow-right" className="h-4 w-4" />
                                </span>
                            </a>

                            <div className="grid content-center gap-1">
                                <a href="#template-list" className="dropdown-item rounded-xl p-3 transition hover:bg-brand-primary/[0.06]" onClick={() => setActiveSection('#template-list')}>
                                    <span className="flex items-center gap-2 text-sm font-semibold text-black">
                                        <Icon name="store" className="h-4 w-4 text-brand-primary" />
                                        UMKM & Bisnis
                                    </span>
                                    <span className="mt-1 block pl-6 text-xs leading-relaxed text-black/55">
                                        Laporan 3-in-1, HPP & margin, inventaris dan stok.
                                    </span>
                                </a>
                                <a href="#template-list" className="dropdown-item rounded-xl p-3 transition hover:bg-brand-primary/[0.06]" onClick={() => setActiveSection('#template-list')}>
                                    <span className="flex items-center gap-2 text-sm font-semibold text-black">
                                        <Icon name="wallet" className="h-4 w-4 text-brand-gold-dark" />
                                        Keuangan Personal
                                    </span>
                                    <span className="mt-1 block pl-6 text-xs leading-relaxed text-black/55">
                                        Monthly Budget Planner dan Debt Payoff Tracker.
                                    </span>
                                </a>
                                <a href="#template-list" className="dropdown-item rounded-xl p-3 transition hover:bg-brand-primary/[0.06]" onClick={() => setActiveSection('#template-list')}>
                                    <span className="flex items-center gap-2 text-sm font-semibold text-black">
                                        <Icon name="calculator" className="h-4 w-4 text-brand-primary" />
                                        Perpajakan
                                    </span>
                                    <span className="mt-1 block pl-6 text-xs leading-relaxed text-black/55">
                                        Rekap PPh Final UMKM dan hitung PPh 21.
                                    </span>
                                </a>
                                <a href="#template-list" className="dropdown-item rounded-xl p-3 transition hover:bg-brand-primary/[0.06]" onClick={() => setActiveSection('#template-list')}>
                                    <span className="flex items-center gap-2 text-sm font-semibold text-black">
                                        <Icon name="sheet" className="h-4 w-4 text-brand-primary" />
                                        Freelancer
                                    </span>
                                    <span className="mt-1 block pl-6 text-xs leading-relaxed text-black/55">
                                        Catat pendapatan dan kelola invoice.
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <a href="#cara-kerja" className={navItemClass('#cara-kerja')} onClick={() => setActiveSection('#cara-kerja')}>Cara Kerja</a>
                <a href="#faq" className={navItemClass('#faq')} onClick={() => setActiveSection('#faq')}>FAQ</a>
            </nav>

            
            <div className="hidden md:flex items-center flex-1 max-w-[220px] lg:max-w-[240px]">
                <div className="relative w-full">
                    <input 
                        type="text" 
                        placeholder="Cari Template..."
                        className="w-full bg-black/[0.04] hover:bg-black/[0.07] focus:bg-white text-xs font-medium rounded-full py-2 pl-8 pr-14 border border-black/10 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition-all text-black placeholder:text-black/40" />
                    <Icon name="search" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-black/40 bg-white px-1.5 py-0.5 rounded border border-black/10">⌘K</span>
                </div>
            </div>

            
            <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-black/40">
                    <span className="text-brand-primary">ID</span>
                    <span className="text-black/20">|</span>
                    <span className="hover:text-black cursor-pointer font-medium">EN</span>
                </div>

                <a href={route('login')} className="px-3 py-2 text-xs font-bold text-black bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition">
                    Masuk
                </a>
                
                <a href={route('register')} className="px-4 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-dark rounded-lg shadow-sm hover:shadow transition-all border border-brand-primary">
                    Daftar
                </a>
            </div>

        </div>
    </header>
        </>
    );
}
