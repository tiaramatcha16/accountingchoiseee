import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthEntryLayout from '@/layouts/auth/auth-entry-layout';

type LoginForm = { email: string; password: string; remember: boolean };
interface LoginProps {
    status?: string;
    googleError?: string;
    roleError?: string;
    canResetPassword: boolean;
    adminMode?: boolean;
}

export default function Login({ status, googleError, roleError, canResetPassword, adminMode = false }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({ email: '', password: '', remember: false });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(adminMode ? route('admin.login.store') : route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthEntryLayout
            title={adminMode ? 'Login Admin Toko' : 'Masuk sebagai Pembeli'}
            description={adminMode ? 'Halaman khusus pengelola toko template Excel.' : 'Masuk untuk melihat pesanan dan membeli template Excel.'}
        >
            <Head title={adminMode ? 'Login Admin' : 'Login Pembeli'} />
            {adminMode && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Akses khusus admin. Akun admin dibuat manual, bukan melalui pendaftaran pembeli.</div>}
            {roleError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{roleError}</div>}
            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required autoFocus autoComplete="email" value={data.email} onChange={(event) => setData('email', event.target.value)} placeholder="email@example.com" disabled={processing} />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            {!adminMode && canResetPassword && <TextLink href={route('password.request')} className="text-brand-primary text-xs">Lupa password?</TextLink>}
                        </div>
                        <div className="relative">
                            <Input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={data.password} onChange={(event) => setData('password', event.target.value)} placeholder="Password" disabled={processing} className="pr-10" />
                            <button type="button" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-black/45">
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="remember" checked={data.remember} onCheckedChange={(checked) => setData('remember', checked === true)} />
                        <Label htmlFor="remember" className="text-xs font-normal">Ingat saya</Label>
                    </div>
                    <Button type="submit" disabled={processing} className="bg-auth-action h-10 w-full rounded-lg font-semibold text-white">
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}{processing ? 'Memproses...' : adminMode ? 'Masuk Admin' : 'Masuk sebagai Pembeli'}
                    </Button>
                </div>

                {!adminMode && <>
                    <GoogleSignInButton />
                    <div className="text-center text-sm text-black/55">Belum punya akun? <TextLink href={route('register')} className="text-brand-primary font-semibold">Daftar pembeli</TextLink></div>
                    <div className="text-center text-xs text-black/45">Pemilik toko? <TextLink href={route('admin.login')} className="text-brand-primary font-semibold">Login admin</TextLink></div>
                </>}
                {adminMode && <div className="text-center text-sm text-black/55">Pembeli? <TextLink href={route('login')} className="text-brand-primary font-semibold">Login pembeli</TextLink></div>}
            </form>
            {status && <div role="status" className="mt-4 text-center text-sm font-medium text-emerald-700">{status}</div>}
            {!adminMode && googleError && <div role="alert" className="mt-4 text-center text-sm font-medium text-red-700">{googleError}</div>}
        </AuthEntryLayout>
    );
}
