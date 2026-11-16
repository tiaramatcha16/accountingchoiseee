import { router, usePage } from '@inertiajs/react';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { type SharedData } from '@/types';

export default function CartDrawer() {
    const { items, removeFromCart, totalAmount, isCartOpen, setIsCartOpen } = useCart();
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
            <SheetContent side="right" className="flex w-full flex-col border-l border-black/10 bg-white p-0 sm:max-w-md">
                <SheetHeader className="border-b border-black/[0.08] p-5 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="bg-brand-primary/10 text-brand-primary flex h-9 w-9 items-center justify-center rounded-xl">
                                <ShoppingBag className="h-5 w-5" />
                            </span>
                            <div>
                                <SheetTitle className="font-heading text-lg font-bold text-black">Keranjang Belanja</SheetTitle>
                                <SheetDescription className="text-xs text-black/55">{items.length} template di dalam keranjang</SheetDescription>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-5">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black/[0.04] text-black/40">
                                <ShoppingBag className="h-8 w-8" />
                            </div>
                            <h4 className="font-heading text-base font-bold text-black">Keranjang masih kosong</h4>
                            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-black/55">
                                Jelajahi katalog template keuangan kami dan klik tombol "+ Keranjang" untuk menambahkan spreadsheet yang kamu
                                butuhkan.
                            </p>
                            <Button
                                variant="outline"
                                className="border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5 mt-6 rounded-xl text-xs font-semibold"
                                onClick={() => {
                                    setIsCartOpen(false);
                                    router.visit(route('catalog.index'));
                                }}
                            >
                                Lihat Katalog Template
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-3 rounded-2xl border border-black/[0.07] bg-white p-3.5 shadow-xs transition hover:border-black/15"
                                >
                                    <div className="min-w-0 flex-1">
                                        <span className="bg-brand-primary/10 text-brand-primary inline-block rounded-md px-2 py-0.5 text-[10px] font-bold">
                                            {item.category}
                                        </span>
                                        <h5 className="font-heading mt-1 line-clamp-2 text-xs leading-snug font-bold text-black">{item.title}</h5>
                                        <p className="text-brand-primary mt-2 text-xs font-bold">{formatRupiah(item.price)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Hapus dari keranjang"
                                        onClick={() => removeFromCart(item.id)}
                                        className="rounded-lg p-1.5 text-black/40 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="space-y-4 border-t border-black/[0.08] bg-slate-50/70 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-black/60">Total Pembayaran</span>
                            <span className="font-heading text-lg font-extrabold text-black">{formatRupiah(totalAmount)}</span>
                        </div>

                        {!user && (
                            <div className="rounded-xl border border-amber-300/40 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                                Kamu belum masuk. Silakan <strong>Masuk</strong> atau <strong>Daftar</strong> untuk menyelesaikan checkout pesanan.
                            </div>
                        )}

                        <Button
                            onClick={handleCheckout}
                            className="bg-brand-primary hover:bg-brand-primary-dark shadow-brand-primary/20 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-md"
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
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
