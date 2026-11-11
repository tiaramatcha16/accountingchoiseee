import { Icon } from './brand-icon';

export default function FloatingActions() {
    return (
        <>
            <a
                className="group fixed right-6 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-primary bg-white text-emerald-600 shadow-2xl transition-all hover:scale-110 hover:bg-slate-50 active:scale-95"
                href="https://wa.me/6282264951711?text=Halo%20AccountingChoice,%20saya%20tertarik%20dengan%20template%20keuangan"
                rel="noreferrer"
                target="_blank"
                title="Hubungi CS via WhatsApp"
            >
                <Icon name="message-circle" className="h-7 w-7 fill-brand-primary/10 text-brand-primary" />
                <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg border border-brand-gold/40 bg-black px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                    Chat WhatsApp Kami
                </span>
            </a>
        </>
    );
}
