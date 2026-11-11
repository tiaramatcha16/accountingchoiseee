import { Icon } from '../../../components/landing-page/brand-icon';

export default function HowItWorks() {
    return (
        <>
<div className="lg:col-span-5 space-y-6">
                    <div>
                        <span className="spark-badge mb-3">
                            <Icon name="zap" className="w-3.5 h-3.5 text-brand-primary" />
                            Alur Akses 1-Klik
                        </span>
                        <h2 className="font-heading text-3xl font-extrabold text-black tracking-tight leading-snug">
                            4 Langkah <span className="highlight-pill text-2xl font-bold">Instan</span> Memulai
                        </h2>
                        <p className="text-sm text-black/60 mt-2 font-normal leading-relaxed">
                            Tanpa setup rumit. Buka file Google Sheets, simpan salinan di Drive Anda, dan langsung kelola pembukuan.
                        </p>
                    </div>

                    <div className="space-y-4 pt-1">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-surface-soft border border-black/[0.06] hover:border-brand-primary/30 transition group">
                            <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-brand-primary/20 border border-brand-gold/40 font-heading">
                                01
                            </div>
                            <div>
                                <h4 className="text-sm font-bold font-heading text-black group-hover:text-brand-primary transition">Pilih Template yang Diinginkan</h4>
                                <p className="text-xs text-black/60 mt-1 leading-relaxed font-normal">
                                    Pilih sesuai kebutuhan: operasional UMKM, keuangan personal, freelancer, atau pajak.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-surface-soft border border-black/[0.06] hover:border-brand-primary/30 transition group">
                            <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-brand-primary/20 border border-brand-gold/40 font-heading">
                                02
                            </div>
                            <div>
                                <h4 className="text-sm font-bold font-heading text-black group-hover:text-brand-primary transition">Masukkan Detail Akun & Email</h4>
                                <p className="text-xs text-black/60 mt-1 leading-relaxed font-normal">
                                    Cantumkan alamat email Gmail Anda untuk hak akses instan salinan Google Drive.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-surface-soft border border-black/[0.06] hover:border-brand-primary/30 transition group">
                            <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-brand-primary/20 border border-brand-gold/40 font-heading">
                                03
                            </div>
                            <div>
                                <h4 className="text-sm font-bold font-heading text-black group-hover:text-brand-primary transition">Pembayaran Otomatis QRIS / Bank</h4>
                                <p className="text-xs text-black/60 mt-1 leading-relaxed font-normal">
                                    Sistem memverifikasi pembayaran secara otomatis detik itu juga tanpa perlu kirim struk manual.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-surface-soft border border-black/[0.06] hover:border-brand-primary/30 transition group">
                            <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-brand-primary/20 border border-brand-gold/40 font-heading">
                                04
                            </div>
                            <div>
                                <h4 className="text-sm font-bold font-heading text-black group-hover:text-brand-primary transition">Template Aktif & Siap Digunakan</h4>
                                <p className="text-xs text-black/60 mt-1 leading-relaxed font-normal">
                                    Tautan salinan spreadsheet langsung terkirim dan tersimpan aman di Google Drive Anda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
        </>
    );
}
