import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Building2, Clock, Globe, Instagram, Linkedin, MapPin, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-brand-gold/60 from-brand-primary via-brand-deep to-brand-midnight relative overflow-hidden border-t-2 bg-gradient-to-b pt-16 pb-12 text-white sm:pt-20 sm:pb-14">
            {/* Subtle decorative background glow */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="bg-brand-gold/10 absolute top-1/2 right-0 h-96 w-96 rounded-full blur-[130px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Main grid with dedicated right margin for mascot */}
                <div className="grid grid-cols-1 gap-10 pb-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pr-64 xl:pr-72">
                    {/* Column 1: Brand & Bio (lg:col-span-5) */}
                    <div className="space-y-4 lg:col-span-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 shadow-md ring-1 shadow-black/20 ring-white/20">
                                <img src="/images/accounting-choice-logo.png" alt="Logo AccountingChoice" className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <span className="font-heading text-2xl font-black tracking-tight text-white">
                                    Accounting<span className="text-brand-gold">Choice</span>
                                </span>
                                <span className="block text-[10px] font-semibold tracking-widest text-emerald-300/80 uppercase">
                                    Pasar Template Excel
                                </span>
                            </div>
                        </div>

                        <p className="text-sm font-medium text-white/90">
                            Kelola keuangan dengan lebih percaya diri <span className="text-brand-gold">✌️</span>
                        </p>

                        <p className="text-xs leading-relaxed text-white/70">
                            Tempat menemukan dan menjual template Excel untuk kebutuhan UMKM, pekerja lepas, keuangan pribadi, dan perpajakan di
                            Indonesia.
                        </p>

                        <div className="pt-1">
                            <Badge
                                variant="outline"
                                className="inline-flex items-center gap-1.5 border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-200"
                            >
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                                <span>Unduh file setelah pembayaran terverifikasi</span>
                            </Badge>
                        </div>
                    </div>

                    {/* Column 2: Kategori Template (lg:col-span-3) */}
                    <div className="space-y-4 lg:col-span-3 lg:pl-2">
                        <h4 className="font-heading text-brand-gold text-xs font-bold tracking-wider uppercase">KATEGORI TEMPLATE</h4>
                        <ul className="space-y-2.5 text-xs font-normal text-white/75">
                            <li>
                                <a href="/#pilih-kebutuhan" className="group flex items-center gap-1.5 transition-colors hover:text-white">
                                    <ArrowRight className="text-brand-gold h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                                    <span>UMKM & Bisnis</span>
                                </a>
                            </li>
                            <li>
                                <a href="/#pilih-kebutuhan" className="group flex items-center gap-1.5 transition-colors hover:text-white">
                                    <ArrowRight className="text-brand-gold h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                                    <span>Keuangan Pribadi</span>
                                </a>
                            </li>
                            <li>
                                <a href="/#pilih-kebutuhan" className="group flex items-center gap-1.5 transition-colors hover:text-white">
                                    <ArrowRight className="text-brand-gold h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                                    <span>Pajak PPh Final & TER</span>
                                </a>
                            </li>
                            <li>
                                <a href="/#template-list" className="group flex items-center gap-1.5 transition-colors hover:text-white">
                                    <ArrowRight className="text-brand-gold h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                                    <span>Semua Template</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Kontak & Kantor Biinspira (lg:col-span-4) */}
                    <div className="space-y-4 lg:col-span-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="text-brand-gold h-4 w-4" />
                            <h4 className="font-heading text-brand-gold text-xs font-bold tracking-wider uppercase">BIINSPIRA GROUP</h4>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/80 backdrop-blur-xs">
                            <div className="flex items-start gap-2.5">
                                <MapPin className="text-brand-gold mt-0.5 h-4 w-4 shrink-0" />
                                <span className="text-[11px] leading-relaxed text-white/75 sm:text-xs">
                                    Perumahan Permata Permadani, Blok B1, Kel. Pendem, Kec. Junrejo, Kota Batu, Jawa Timur 65324
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 pt-1">
                                <Phone className="text-brand-gold h-4 w-4 shrink-0" />
                                <a
                                    href="tel:+6282264951711"
                                    className="hover:text-brand-gold text-[11px] font-medium text-white/90 transition-colors sm:text-xs"
                                >
                                    0822-6495-1711
                                </a>
                            </div>

                            <div className="flex items-center gap-2.5 pt-0.5">
                                <Clock className="text-brand-gold h-4 w-4 shrink-0" />
                                <span className="text-[11px] font-medium text-emerald-300 sm:text-xs">Layanan Akses Digital 24/7</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="pt-1">
                            <span className="font-heading mb-2 block text-[10px] font-bold tracking-widest text-white/60 uppercase">IKUTI KAMI</span>
                            <div className="flex items-center gap-2.5">
                                <a
                                    href="https://instagram.com"
                                    rel="noreferrer"
                                    target="_blank"
                                    aria-label="Instagram AccountingChoice"
                                    className="hover:border-brand-gold hover:bg-brand-gold flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:text-slate-900"
                                >
                                    <Instagram className="h-4 w-4" />
                                </a>
                                <a
                                    href="https://linkedin.com"
                                    rel="noreferrer"
                                    target="_blank"
                                    aria-label="LinkedIn AccountingChoice"
                                    className="hover:border-brand-gold hover:bg-brand-gold flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:text-slate-900"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </a>
                                <a
                                    href="https://biinspira.com"
                                    rel="noreferrer"
                                    target="_blank"
                                    aria-label="Website Biinspira Group"
                                    className="hover:border-brand-gold hover:bg-brand-gold flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:text-slate-900"
                                >
                                    <Globe className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Sub-footer Copyright Bar */}
                <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-white/65 sm:flex-row">
                    <p> © 2026 Biinspira Group. Hak cipta dilindungi.</p>
                    <div className="flex items-center gap-4 text-[11px] text-white/60">
                        <span>Privasi Terlindungi</span>
                        <span>•</span>
                        <span>Unduh Setelah Lunas</span>
                        <span>•</span>
                        <span>File Digital Excel</span>
                    </div>
                </div>
            </div>

            {/* Cute Accounting Mascot Peeking from side (Elevated, visible, tilted, static) */}
            <div className="pointer-events-none absolute right-0 bottom-10 z-20 translate-x-[15%] select-none sm:bottom-14 sm:translate-x-[12%] md:bottom-16">
                <div className="origin-bottom-right -rotate-[14deg] drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)]">
                    <div className="h-auto w-56 sm:w-64 md:w-72 lg:w-84">
                        <img src="/images/mascot_footer.png?v=9" alt="Cute Accounting Mascot" className="h-full w-full object-contain filter" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
