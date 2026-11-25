import { FileSpreadsheet } from 'lucide-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1d1d1f] text-white shadow-xs shrink-0">
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            </span>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-tight text-[#1d1d1f]">
                    Accounting<span className="text-emerald-700">Choice</span>
                </span>
                <span className="truncate text-[10px] text-[#86868b] font-medium">Panel Administrasi</span>
            </div>
        </div>
    );
}
