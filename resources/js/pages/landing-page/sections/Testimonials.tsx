import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Marquee } from '@/components/ui/3d-testimonails';

// Testimonial pembeli asli Indonesia untuk seluruh kategori template
export const testimonials = [
  // Kolom 1
  {
    name: 'Bayu Wicaksono',
    role: 'Karyawan Swasta',
    category: 'Keuangan Pribadi',
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200/60',
    username: '@bayuwicak',
    body: 'Template Budgeting 50/30/20 bener-bener nyelametin gaji bulanan. Pos tabungan dana darurat jadi disiplin dan grafiknya rapi.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    city: 'Jakarta Selatan',
  },
  {
    name: 'Siti Rahmawati',
    role: 'Freelance UI/UX',
    category: 'Freelancer',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
    username: '@sitirahma',
    body: 'Status tagihan invoice unpaid dari banyak klien terpantau jelas. Otomatis ke-duplicate ke Google Drive tanpa ribet setting manual.',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    city: 'Bandung',
  },
  {
    name: 'Budi Santoso',
    role: 'Owner Kedai Kopi',
    category: 'UMKM & Bisnis',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
    username: '@budisantoso',
    body: 'Template Laba Rugi UMKM praktis banget. Input nota belanja harian, omzet dan net profit langsung kehitung rapi otomatis.',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    city: 'Yogyakarta',
  },

  // Kolom 2
  {
    name: 'Rian Pratama',
    role: 'Konsultan Pajak',
    category: 'Perpajakan',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200/60',
    username: '@rianpratama',
    body: 'Kalkulator PPh Final 0.5% UMKM dan PPh 21 TER rumusnya presisi sesuai aturan terbaru. Hitung pajak bulanan jadi hitungan menit.',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    city: 'Tangerang',
  },
  {
    name: 'Annisa Larasati',
    role: 'Mompreneur',
    category: 'Keuangan Pribadi',
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200/60',
    username: '@annisa.laras',
    body: 'Pos belanja dapur, tabungan, dan cicilan rumah terorganisir banget. Enak dibuka lewat Google Sheets HP kapan aja.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    city: 'Surabaya',
  },
  {
    name: 'Dimas Aditya',
    role: 'Content Creator',
    category: 'Freelancer',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
    username: '@dimasadit',
    body: 'Dulu pusing pisahin uang pribadi sama invoice project video. Pakai template arus kas ini sekarang keuangan super transparan.',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    city: 'Malang',
  },

  // Kolom 3
  {
    name: 'Hendra Gunawan',
    role: 'Accounting Supervisor',
    category: 'Perpajakan',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200/60',
    username: '@hendragun',
    body: 'Rekapitulasi bukti potong dan simulasi PPh 21 karyawan rapi. Standar formulanya patuh pada regulasi perpajakan.',
    img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    city: 'Semarang',
  },
  {
    name: 'Dian Permata',
    role: 'Founder DianStore',
    category: 'UMKM & Bisnis',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
    username: '@dianpermata',
    body: 'Kontrol stok gudang sama HPP akurat sampai margin per item. Begitu bayar via QRIS, file spreadsheet langsung aktif.',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    city: 'Solo',
  },
  {
    name: 'Fauzan Rizky',
    role: 'Software Engineer',
    category: 'Keuangan Pribadi',
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200/60',
    username: '@fauzanriz',
    body: 'Template debt snowball payoff ngebantu rencana pelunasan cicilan terstruktur. Formula otomatis dan bebas ribet.',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    city: 'Depok',
  },

  // Kolom 4
  {
    name: 'Nadia Safitri',
    role: 'Freelance Copywriter',
    category: 'Freelancer',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
    username: '@nadiasafitri',
    body: 'Kalkulator rate per jam sangat memudahkan saat kirim proposal penawaran harga ke klien internasional.',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    city: 'Bogor',
  },
  {
    name: 'Irfan Hakim',
    role: 'Retail Store Owner',
    category: 'Perpajakan',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200/60',
    username: '@irfanhakim',
    body: 'Laporan omzet bulanan untuk setor PPh Final 0,5% PP 55 jadi gampang banget direkap saat pelaporan SPT Tahunan.',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    city: 'Bekasi',
  },
  {
    name: 'Dewi Anggraini',
    role: 'Owner Catering',
    category: 'UMKM & Bisnis',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
    username: '@dewianggra',
    body: 'HPP per porsi catering dan neraca saldo seimbang otomatis tanpa saya harus belajar rumus akuntansi yang rumit.',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    city: 'Jakarta Barat',
  },
];

function TestimonialCard({ img, name, role, body }: (typeof testimonials)[number]) {
  return (
    <Card className="w-72 sm:w-80 border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transform-gpu">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-black/[0.06] shrink-0">
            <AvatarImage src={img} alt={name} className="object-cover" loading="lazy" />
            <AvatarFallback className="bg-neutral-100 text-neutral-800 text-xs font-bold">{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[#1d1d1f] truncate">{name}</span>
            <p className="text-[11px] text-[#86868b] truncate">{role}</p>
          </div>
        </div>

        <blockquote className="mt-3 text-xs leading-relaxed text-[#1d1d1f]/90">
          "{body}"
        </blockquote>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimoni" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32 bg-[#fbfbfd]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-tight">
          Solusi Keuangan untuk Setiap Kebutuhan.
          <br />
          <span className="text-[#86868b]">UMKM, Keuangan Pribadi, Pajak & Freelancer.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-[#86868b] leading-relaxed">
          Temukan cerita nyata pengguna template AccountingChoice dari berbagai bidang dalam merapikan arus kas, menghitung pajak, hingga mengelola bisnis.
        </p>
      </div>

      {/* Full-width edge-to-edge container dengan isolasi hardware acceleration GPU */}
      <div
        className="relative w-full h-[580px] sm:h-[640px] flex items-center justify-center overflow-hidden [perspective:1000px] transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="flex flex-row items-center gap-5 sm:gap-7 transform-gpu pointer-events-auto"
          style={{
            transform: 'rotateX(10deg) rotateZ(6deg) translateZ(0)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Kolom 1 (Bergerak Turun) */}
          <Marquee vertical pauseOnHover repeat={2} className="[--duration:28s] py-2">
            {testimonials.slice(0, 3).map((review) => (
              <TestimonialCard key={`c1-${review.username}`} {...review} />
            ))}
          </Marquee>

          {/* Kolom 2 (Bergerak Naik) */}
          <Marquee vertical pauseOnHover reverse repeat={2} className="[--duration:24s] py-2">
            {testimonials.slice(3, 6).map((review) => (
              <TestimonialCard key={`c2-${review.username}`} {...review} />
            ))}
          </Marquee>

          {/* Kolom 3 (Bergerak Turun) */}
          <Marquee vertical pauseOnHover repeat={2} className="[--duration:26s] py-2">
            {testimonials.slice(6, 9).map((review) => (
              <TestimonialCard key={`c3-${review.username}`} {...review} />
            ))}
          </Marquee>

          {/* Kolom 4 (Bergerak Naik) */}
          <Marquee vertical pauseOnHover reverse repeat={2} className="[--duration:25s] py-2">
            {testimonials.slice(9, 12).map((review) => (
              <TestimonialCard key={`c4-${review.username}`} {...review} />
            ))}
          </Marquee>

          {/* Kolom 5 (Layar Desktop Lebar) */}
          <Marquee vertical pauseOnHover repeat={2} className="hidden lg:flex [--duration:27s] py-2">
            {testimonials.slice(0, 3).map((review) => (
              <TestimonialCard key={`c5-${review.username}`} {...review} />
            ))}
          </Marquee>

          {/* Kolom 6 (Layar Sangat Lebar) */}
          <Marquee vertical pauseOnHover reverse repeat={2} className="hidden 2xl:flex [--duration:25s] py-2">
            {testimonials.slice(3, 6).map((review) => (
              <TestimonialCard key={`c6-${review.username}`} {...review} />
            ))}
          </Marquee>
        </div>

        {/* Soft edge fade overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#fbfbfd] via-[#fbfbfd]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbfbfd] via-[#fbfbfd]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 sm:w-48 bg-gradient-to-r from-[#fbfbfd] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 sm:w-48 bg-gradient-to-l from-[#fbfbfd] to-transparent z-10" />
      </div>
    </section>
  );
}
