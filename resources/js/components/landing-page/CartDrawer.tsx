import { router, usePage } from '@inertiajs/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { type SharedData } from '@/types';

export default function CartDrawer() {
    const { items, removeFromCart, updateQuantity, totalAmount, isCartOpen, setIsCartOpen } = useCart();
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const formatRupiah = (val: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);

    const handleCheckout = () => {
        if (!user) {
            setIsCartOpen(false);
            router.visit(route('login'));
            return;
        }

        if (items.length === 0) return;

        setIsCartOpen(false);
        router.visit(route('checkout.show'));
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent side="right" className="flex w-full flex-col border-l border-black/[0.06] bg-[#fbfbfd] p-0 sm:max-w-md">
                <SheetHeader className="border-b border-black/[0.06] bg-white p-5 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                                <ShoppingBag className="h-5 w-5" />
                            </span>
                            <div>
                                <SheetTitle className="text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">Keranjang Belanja</SheetTitle>
                                <SheetDescription className="text-xs text-[#86868b]">
                                    {items.reduce((s, it) => s + (it.quantity || 1), 0)} unit template di dalam keranjang
                                </SheetDescription>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-5">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-[#86868b]">
                                <ShoppingBag className="h-8 w-8" />
                            </div>
                            <h4 className="text-base font-semibold tracking-[-0.02em] text-[#1d1d1f]">Keranjang masih kosong</h4>
                            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#86868b]">
                                Jelajahi katalog template keuangan kami dan klik tombol &quot;+ Keranjang&quot; untuk menambahkan spreadsheet yang kamu
                                butuhkan.
                            </p>
                            <button
                                type="button"
                                className="mt-6 rounded-full border border-black/[0.08] bg-white px-5 py-2 text-xs font-semibold text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:bg-neutral-50 active:scale-[0.98]"
                                onClick={() => {
                                    setIsCartOpen(false);
                                    router.visit(route('catalog.index'));
                                }}
                            >
                                Lihat Katalog Template
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-black/[0.06] bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:border-black/[0.12]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                                                {item.category}
                                            </span>
                                            <h5 className="mt-1 line-clamp-2 text-xs leading-snug font-semibold text-[#1d1d1f]">{item.title}</h5>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label="Hapus dari keranjang"
                                            onClick={() => removeFromCart(item.id)}
                                            className="rounded-xl p-1.5 text-[#86868b] transition hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t border-black/[0.05] pt-2.5">
                                        <div className="flex items-center rounded-xl border border-black/[0.08] bg-[#f5f5f7] p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                                aria-label="Kurangi jumlah"
                                                className="flex h-6 w-6 items-center justify-center rounded-lg text-[#86868b] transition hover:bg-white hover:text-[#1d1d1f] hover:shadow-xs"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-xs font-semibold text-[#1d1d1f]">{item.quantity || 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                aria-label="Tambah jumlah"
                                                className="flex h-6 w-6 items-center justify-center rounded-lg text-[#86868b] transition hover:bg-white hover:text-[#1d1d1f] hover:shadow-xs"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-[#1d1d1f]">
                                                {formatRupiah((item.price || 0) * (item.quantity || 1))}
                                            </p>
                                            {(item.quantity || 1) > 1 && (
                                                <p className="text-[10px] text-[#86868b]">{formatRupiah(item.price)} / unit</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="space-y-4 border-t border-black/[0.06] bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#86868b]">Total Pembayaran</span>
                            <span className="text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">{formatRupiah(totalAmount)}</span>
                        </div>

                        {!user && (
                            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-900">
                                Kamu belum masuk. Silakan <strong>Masuk</strong> atau <strong>Daftar</strong> untuk menyelesaikan checkout pesanan.
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleCheckout}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] text-sm font-semibold text-white shadow-sm transition hover:bg-[#333336] hover:shadow-md active:scale-[0.98]"
                        >
                            {user ? (
                                <>
                                    Lanjut ke Checkout
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Masuk untuk Membuat Pesanan
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
