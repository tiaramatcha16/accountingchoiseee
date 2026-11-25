import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import AuthEntryLayout from '@/layouts/auth/auth-entry-layout';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('register.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthEntryLayout
            title="Buat Akun Baru"
            description="Daftar untuk membeli dan mengelola template akuntansi Anda."
            size="register"
        >
            <Head title="Daftar Akun - AccountingChoice" />

            <form className="flex flex-col gap-4 text-left" onSubmit={submit}>
                <div className="grid gap-3.5">
                    {/* Name */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold text-[#1d1d1f]">
                            Nama Lengkap
                        </Label>
                        <input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Contoh: Budi Santoso"
                            className="h-11 w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 text-xs font-medium text-[#1d1d1f] placeholder:text-neutral-400 focus:border-black/[0.2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold text-[#1d1d1f]">
                            Alamat Email
                        </Label>
                        <input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="nama@email.com"
                            className="h-11 w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 text-xs font-medium text-[#1d1d1f] placeholder:text-neutral-400 focus:border-black/[0.2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Phone */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="phone" className="text-xs font-semibold text-[#1d1d1f]">
                            Nomor WhatsApp / HP
                        </Label>
                        <input
                            id="phone"
                            type="tel"
                            required
                            tabIndex={3}
                            autoComplete="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={processing}
                            placeholder="081234567890"
                            className="h-11 w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 text-xs font-medium text-[#1d1d1f] placeholder:text-neutral-400 focus:border-black/[0.2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    {/* Password */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password" className="text-xs font-semibold text-[#1d1d1f]">
                            Password
                        </Label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Minimal 8 karakter"
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

                    {/* Password Confirmation */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password_confirmation" className="text-xs font-semibold text-[#1d1d1f]">
                            Konfirmasi Password
                        </Label>
                        <div className="relative">
                            <input
                                id="password_confirmation"
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                required
                                tabIndex={5}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Ulangi password"
                                className="h-11 w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 pr-11 text-xs font-medium text-[#1d1d1f] placeholder:text-neutral-400 focus:border-black/[0.2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                            />
                            <button
                                type="button"
                                aria-label={showPasswordConfirmation ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-400 hover:text-neutral-700 transition"
                            >
                                {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin text-white" />}
                        <span>{processing ? 'Mendaftarkan Akun...' : 'Daftar Akun'}</span>
                    </button>
                </div>

                {/* Footer text */}
                <div className="mt-4 text-center text-xs text-[#86868b]">
                    Sudah memiliki akun?{' '}
                    <Link href={route('login')} className="font-semibold text-emerald-700 hover:text-emerald-900 transition">
                        Masuk di sini
                    </Link>
                </div>
            </form>
        </AuthEntryLayout>
    );
}
