import { Icon } from './brand-icon';

export default function Footer() {
    return (
        <>
<footer className="relative bg-gradient-to-b from-brand-primary via-brand-deep to-brand-midnight text-white pt-20 pb-10 overflow-hidden border-t-4 border-brand-gold">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-10 pb-14 border-b border-white/10">
                
                
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/accounting-choice-logo.png"
                            alt="Logo AccountingChoice"
                            className="h-10 w-12 rounded-xl bg-white p-1 object-contain shadow-md"
                        />
                        <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                            Accounting<span className="text-brand-gold">Choice</span>
                        </span>
                    </div>

                    <p className="text-sm text-white/90 font-medium">
                        Manage Finance With More Confidence <span className="text-brand-gold">✌️</span>
                    </p>

                    <div className="pt-1 text-xs text-white/80 space-y-1.5 font-normal">
                        <p className="font-bold text-white text-sm font-heading">Biinspira Group</p>
                        <p className="text-[12px] text-white/70 leading-relaxed">
                            <Icon name="map-pin" className="w-3.5 h-3.5 text-brand-gold inline mr-1" />
                            Perumahan Permata Permadani, Blok B1.<br />
                            Kel. Pendem Kec. Junrejo, Kota Batu, Jawa Timur 65324
                        </p>
                        <p className="text-[12px] text-white/70 pt-1">
                            <Icon name="phone" className="w-3.5 h-3.5 text-brand-gold inline mr-1" />
                            0822-6495-1711
                        </p>
                    </div>

                    
                    <div className="pt-3">
                        <span className="text-[10px] font-bold font-heading text-brand-gold block mb-2.5 uppercase tracking-widest">Ikuti Kami</span>
                        <div className="flex items-center gap-2.5">
                            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-brand-gold hover:text-black flex items-center justify-center text-white transition text-xs border border-white/10">
                                <Icon name="instagram" className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-brand-gold hover:text-black flex items-center justify-center text-white transition text-xs border border-white/10">
                                <Icon name="linkedin" className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-brand-gold hover:text-black flex items-center justify-center text-white transition text-xs border border-white/10">
                                <Icon name="globe" className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                
                <div className="lg:col-span-4 space-y-3.5">
                    <h4 className="text-xs font-bold font-heading text-white uppercase tracking-wider">LAYANAN</h4>
                    <ul className="space-y-2.5 text-xs text-white/80 font-normal">
                        <li><a href="#cara-kerja" className="hover:text-brand-gold transition">Pusat Bantuan</a></li>
                        <li><a href="#cara-kerja" className="hover:text-brand-gold transition">Cara Akses</a></li>
                        <li><a href="#faq" className="hover:text-brand-gold transition">Panduan Rumus</a></li>
                        <li><a href="https://wa.me/6282264951711" target="_blank" rel="noreferrer" className="hover:text-brand-gold transition">Konsultasi WA</a></li>
                    </ul>
                </div>
            </div>

            
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
                <p>© 2026 Biinspira Group. All rights reserved.</p>
            </div>
        </div>

        
        <div className="absolute -bottom-1 right-2 sm:right-16 z-20 pointer-events-none select-none">
            <div className="animate-accounting-peek w-36 sm:w-44 h-auto drop-shadow-2xl">
                <img
                    src="/images/mascot_footer.png"
                    alt="Cute Accounting Mascot"
                    className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                />
            </div>
        </div>

    </footer>
        </>
    );
}
