import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AuthEntryLayout from '@/layouts/auth/auth-entry-layout';

type LoginForm = { email: string; password: string; remember: boolean };
interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/login', {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthEntryLayout title="Masuk ke Akun" description="Akses riwayat pesanan dan template spreadsheet Anda.">
            <Head title="Masuk - AccountingChoice" />

            {status && (
                <div
                    role="status"
                    className="animate-in fade-in slide-in-from-top-2 mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/80 px-4 py-3 text-xs font-semibold text-emerald-800"
                >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="leading-snug">{status}</p>
                </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={submit}>
                <div className="grid gap-4">
                    {/* Email Field */}
                    <div className="grid gap-1.5 text-left">
                        <Label htmlFor="email" className="text-xs font-semibold text-[#1d1d1f]">
                            Alamat Email
                        </Label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            placeholder="nama@email.com"
                            disabled={processing}
                            className="h-11 w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 text-xs font-medium text-[#1d1d1f] placeholder:text-neutral-400 focus:border-black/[0.2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password Field */}
                    <div className="grid gap-1.5 text-left">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-semibold text-[#1d1d1f]">
                                Password
                            </Label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-[11px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                placeholder="Masukkan password Anda"
                                disabled={processing}
                                className="h-11 w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 pr-11 text-xs font-medium text-[#1d1d1f] placeholder:text-neutral-400 focus:border-black/[0.2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-400 hover:text-neutral-700 transition"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            className="rounded-lg border-black/[0.15]"
                        />
                        <Label htmlFor="remember" className="text-xs font-normal text-[#86868b] cursor-pointer">
                            Ingat saya di perangkat ini
                        </Label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin text-white" />}
                        <span>{processing ? 'Memverifikasi...' : 'Masuk'}</span>
                    </button>
                </div>

                {/* Footer text */}
                <div className="mt-4 text-center text-xs text-[#86868b]">
                    Belum memiliki akun?{' '}
                    <Link href={route('register')} className="font-semibold text-emerald-700 hover:text-emerald-900 transition">
                        Daftar sekarang
                    </Link>
                </div>
            </form>
        </AuthEntryLayout>
    );
}
