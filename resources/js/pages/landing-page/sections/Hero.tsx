import { Icon } from '../../../components/landing-page/brand-icon';

export default function Hero() {
    return (
        <>
<section id="hero" className="relative pt-20 sm:pt-28 pb-8 overflow-visible">
        
        <div className="absolute left-0 right-0 top-0 -bottom-80 pointer-events-none z-0" style={{ overflow: 'visible' }}>
            <div className="absolute -left-28 top-20 w-[420px] h-[520px] bg-gradient-to-r from-emerald-400/22 via-brand-primary/15 to-transparent rounded-full blur-[90px]"></div>
            <div className="absolute -right-28 top-28 w-[420px] h-[520px] bg-gradient-to-l from-emerald-400/20 via-brand-primary/15 to-transparent rounded-full blur-[90px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            
            
            <div className="relative pt-6 px-6 pb-0 sm:pt-7 sm:px-7 sm:pb-0 lg:pt-8 lg:px-8 lg:pb-0 text-white">
                
                <svg aria-hidden="true" focusable="false" className="absolute inset-0 h-full w-full pointer-events-none" style={{ display: 'block' }} viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="hero-banner-gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--color-brand-deep)"></stop>
                            <stop offset="50%" stopColor="var(--color-brand-primary)"></stop>
                            <stop offset="100%" stopColor="var(--color-brand-dark-green)"></stop>
                        </linearGradient>
                        <pattern id="hero-banner-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="var(--color-brand-gold)"></circle>
                        </pattern>
                    </defs>
                    <path d="M40 0 H430 C458 0 452 28 475 47 C490 60 510 60 530 60 H960 C982 60 1000 78 1000 100 V260 C1000 282 982 300 960 300 H40 C18 300 0 282 0 260 V40 C0 18 18 0 40 0 Z" fill="url(#hero-banner-gradient)"></path>
                    <path d="M40 0 H430 C458 0 452 28 475 47 C490 60 510 60 530 60 H960 C982 60 1000 78 1000 100 V260 C1000 282 982 300 960 300 H40 C18 300 0 282 0 260 V40 C0 18 18 0 40 0 Z" fill="url(#hero-banner-dots)" opacity="0.1"></path>
                </svg>
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-gold/15 rounded-full blur-2xl pointer-events-none"></div>

                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end pb-0">
                    
                    
                    <div className="lg:col-span-5 space-y-3.5 pb-6 lg:pb-8 lg:translate-y-[-4px]">
                        
                        
                        <h1 className="font-heading italic text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.08] text-white">
                            Smart Financial Templates <br className="hidden sm:inline" />
                            <span className="text-brand-gold">for Modern Business.</span>
                        </h1>

                        
                        <p className="text-xs sm:text-sm text-white/85 max-w-md font-normal leading-relaxed">
                            Otomasi pembukuan UMKM, kalkulasi pajak, dan perencanaan arus kas profesional. Cukup buka di browser, input angka, dan laporan langsung tersaji rapi.
                        </p>

                        
                        <div className="pt-1">
                            <a href="#template-list" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm bg-brand-gold hover:bg-brand-gold-dark text-black shadow-md shadow-brand-gold/25 transition-all transform hover:-translate-y-0.5">
                                <span>Eksplorasi Template</span>
                                <Icon name="arrow-right" className="w-4 h-4 text-black" />
                            </a>
                        </div>

                    </div>

                    
                    <div className="lg:col-span-7 flex flex-col sm:flex-row items-end justify-end relative self-end leading-none">
                        
                        
                        <div className="group w-full sm:w-[350px] lg:w-[340px] bg-white rounded-2xl p-3.5 sm:p-4 text-black shadow-2xl border border-white/50 relative z-20 shrink-0 mb-5 lg:mb-0 lg:-translate-y-7 sm:-mr-12 lg:-mr-16 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-8 hover:scale-[1.01] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)] hover:border-brand-gold/60">
                            
                            
                            <div className="flex items-center justify-between border-b border-black/[0.08] pb-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 group-hover:scale-110 transition-transform"></span>
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:scale-110 transition-transform"></span>
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform"></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-1 text-[11px] font-bold text-slate-700">
                                        <span className="w-4 h-4 rounded bg-brand-excel text-white flex items-center justify-center text-[9px] font-extrabold shadow-2xs">X</span>
                                        <span className="font-mono text-[10.5px]">umkm_2026.xlsx</span>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-excel/10 text-brand-excel border border-brand-excel/20">Rumus Aktif</span>
                            </div>

                            
                            <div className="flex items-center gap-1.5 bg-slate-100/90 rounded-lg px-2 py-1 mb-2 text-[10px] font-mono border border-slate-200">
                                <span className="font-bold text-slate-500 px-1 border-r border-slate-300 text-[9px]">D4</span>
                                <span className="italic text-slate-400 font-serif font-bold text-[11px]">fx</span>
                                <span className="text-brand-primary font-semibold truncate text-[9.5px]">=D1-D2-D3</span>
                            </div>

                            
                            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white text-[10px]">
                                
                                <div className="grid grid-cols-12 bg-slate-100 text-slate-500 font-semibold border-b border-slate-200 text-center py-1 text-[9px]">
                                    <div className="col-span-1 border-r border-slate-200 bg-slate-200/60 font-mono">#</div>
                                    <div className="col-span-5 border-r border-slate-200 text-left pl-2 font-medium">A (Akun)</div>
                                    <div className="col-span-3 border-r border-slate-200 font-medium">B (Tipe)</div>
                                    <div className="col-span-3 text-right pr-2 font-medium">C (Total)</div>
                                </div>

                                
                                <div className="grid grid-cols-12 border-b border-slate-100 py-1 items-center hover:bg-slate-50 transition-colors">
                                    <div className="col-span-1 text-center font-mono text-[8.5px] text-slate-400 bg-slate-50/50">1</div>
                                    <div className="col-span-5 pl-2 font-medium text-slate-800 truncate">Omset Penjualan</div>
                                    <div className="col-span-3 text-center"><span className="px-1.5 py-0.2 rounded text-[8px] bg-emerald-50 text-emerald-700 font-semibold">Kredit</span></div>
                                    <div className="col-span-3 text-right pr-2 font-mono text-slate-700">Rp 65.4jt</div>
                                </div>

                                
                                <div className="grid grid-cols-12 border-b border-slate-100 py-1 items-center hover:bg-slate-50 transition-colors">
                                    <div className="col-span-1 text-center font-mono text-[8.5px] text-slate-400 bg-slate-50/50">2</div>
                                    <div className="col-span-5 pl-2 font-medium text-slate-800 truncate">HPP & Biaya</div>
                                    <div className="col-span-3 text-center"><span className="px-1.5 py-0.2 rounded text-[8.5px] bg-rose-50 text-rose-700 font-semibold">Debit</span></div>
                                    <div className="col-span-3 text-right pr-2 font-mono text-slate-700">Rp 46.6jt</div>
                                </div>

                                
                                <div className="grid grid-cols-12 bg-brand-primary/[0.08] border-t border-brand-primary/30 py-1.5 items-center font-bold">
                                    <div className="col-span-1 text-center font-mono text-[9px] text-brand-primary bg-brand-primary/15">3</div>
                                    <div className="col-span-5 pl-2 text-brand-primary truncate flex items-center gap-1">
                                        <span>LABA BERSIH</span>
                                    </div>
                                    <div className="col-span-3 text-center"><span className="px-1.5 py-0.5 rounded text-[8px] bg-brand-primary text-white font-bold tracking-wider shadow-2xs">BALANCE ✓</span></div>
                                    <div className="col-span-3 text-right pr-2 font-mono text-brand-primary text-[10.5px]">Rp 18.8jt</div>
                                </div>
                            </div>

                            
                            <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px]">
                                <div className="flex items-center gap-1 font-medium">
                                    <span className="bg-slate-100 text-brand-excel font-bold px-2 py-0.5 rounded border border-b-2 border-slate-300 border-b-brand-excel flex items-center gap-1">
                                        <Icon name="sheet" className="w-3 h-3 text-brand-excel" />
                                        <span>Laba Rugi</span>
                                    </span>
                                    <span className="text-slate-500 hover:text-black px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer">Neraca</span>
                                    <span className="text-slate-500 hover:text-black px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer">Arus Kas</span>
                                    <span className="text-slate-400 hover:text-black px-1 py-0.5 font-bold cursor-pointer">+</span>
                                </div>
                                <span className="text-[8.5px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Icon name="sparkles" className="w-2.5 h-2.5 text-brand-gold" />
                                    Otomatis
                                </span>
                            </div>

                        </div>

                        
                        <div className="group/mascot w-full sm:w-[420px] md:w-[480px] lg:w-[540px] xl:w-[580px] max-w-none flex items-end justify-end cursor-pointer select-none -mt-20 sm:-mt-28 lg:-mt-36 -mr-8 sm:-mr-12 lg:-mr-16 mb-0 z-30 transition-all duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.02]">
                            <img 
                                src="/images/mascot_hero.png" 
                                alt="Akuntan Menyambut Ramah" 
                                className="w-full h-auto max-h-[500px] sm:max-h-[580px] lg:max-h-[640px] object-contain object-bottom block filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] group-hover/mascot:drop-shadow-[0_35px_65px_rgba(0,0,0,0.85)] group-hover/mascot:brightness-105 transition-all duration-300 ease-out"
                                style={{ verticalAlign: 'bottom', marginBottom: '0px' }} />
                        </div>

                    </div>

                </div>

            </div>
        </div>
    </section>
        </>
    );
}
