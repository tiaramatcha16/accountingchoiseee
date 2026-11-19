import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthEntryLayout from '@/layouts/auth/auth-entry-layout';

type LoginForm = { email: string; password: string; remember: boolean };
interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({ email: '', password: '', remember: false });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('login.store'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthEntryLayout title="Masuk" description="Masuk untuk mengakses akun dan pesanan Anda.">
            <Head title="Masuk" />
            {status && (
                <div
                    role="status"
                    className="animate-in fade-in slide-in-from-top-2 mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm"
                >
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                    <p className="leading-snug">{status}</p>
                </div>
            )}
            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            placeholder="email@example.com"
                            disabled={processing}
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="text-brand-primary text-xs">
                                    Lupa password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                placeholder="Password"
                                disabled={processing}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-black/45"
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="remember" checked={data.remember} onCheckedChange={(checked) => setData('remember', checked === true)} />
                        <Label htmlFor="remember" className="text-xs font-normal">
                            Ingat saya
                        </Label>
                    </div>
                    <HoverBorderGradient
                        type="submit"
                        containerClassName="h-10 w-full rounded-lg focus-visible:outline-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60"
                        className="bg-auth-action hover:bg-brand-primary h-full w-full rounded-lg font-semibold text-white transition-colors"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Memproses...' : 'Masuk'}
                    </HoverBorderGradient>
                </div>
                <div className="text-center text-sm text-black/55">
                    Belum punya akun?{' '}
                    <TextLink href={route('register')} className="text-brand-primary font-semibold">
                        Daftar pembeli
                    </TextLink>
                </div>
            </form>
        </AuthEntryLayout>
    );
}
