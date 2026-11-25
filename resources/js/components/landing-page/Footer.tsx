import { Clock, FileSpreadsheet, Globe, Instagram, Linkedin, MapPin, Phone } from 'lucide-react';

const navigation = [
    { label: 'Beranda', href: '/#hero' },
    { label: 'Fitur Utama', href: '/#fitur' },
    { label: 'Katalog Template', href: '/#template-list' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'FAQ', href: '/#faq' },
];

const categories = [
    { label: 'UMKM & Bisnis', href: '/#template-list' },
    { label: 'Keuangan Pribadi', href: '/#template-list' },
    { label: 'Perpajakan & PPh', href: '/#template-list' },
    { label: 'Pekerja Lepas', href: '/#template-list' },
];

export default function Footer() {
    return (
        <footer className="border-t border-black/[0.06] bg-[#fbfbfd] pt-16 pb-12 text-[#1d1d1f]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-black/[0.06]">
                    {/* Brand */}
                    <div className="space-y-4">
                        <a href="/" className="inline-flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1d1d1f] text-white">
                                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                            </span>
                            <span className="text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                                Accounting<span className="text-emerald-700">Choice</span>
                            </span>
                        </a>
                        <p className="text-xs text-[#86868b] leading-relaxed">
                            Pusat template Google Sheets & Excel resmi untuk kebutuhan UMKM, akuntan, pekerja lepas, dan keuangan keluarga di Indonesia.
                        </p>
                    </div>

                    {/* Nav */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Navigasi</h4>
                        <ul className="space-y-2.5 text-xs text-[#86868b]">
                            {navigation.map((item) => (
                                <li key={item.label}>
                                    <a href={item.href} className="transition hover:text-[#1d1d1f]">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Kategori</h4>
                        <ul className="space-y-2.5 text-xs text-[#86868b]">
                            {categories.map((item) => (
                                <li key={item.label}>
                                    <a href={item.href} className="transition hover:text-[#1d1d1f]">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Dukungan</h4>
                        <ul className="space-y-2.5 text-xs text-[#86868b]">
                            <li className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                <span>0822-6495-1711</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Akses Instan 24 Jam</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Batu, Jawa Timur, Indonesia</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
                    <p>© {new Date().getFullYear()} AccountingChoice. Hak cipta dilindungi.</p>
                </div>
            </div>
        </footer>
    );
}
