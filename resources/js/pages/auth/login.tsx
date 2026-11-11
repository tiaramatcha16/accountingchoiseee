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

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    googleError?: string;
    canResetPassword: boolean;
}

export default function Login({ status, googleError, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthEntryLayout title="Masuk ke AccountingChoice" description="Silakan masukkan informasi akun kamu.">
            <Head title="Masuk" />

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-brand-ink text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            disabled={processing}
                            className="text-brand-ink border-auth-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 h-10 rounded-lg bg-white/70 placeholder:text-black/40"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-brand-ink text-sm font-medium">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink
                                    href={route('password.request')}
                                    className="text-brand-primary decoration-brand-primary/40 text-xs"
                                    tabIndex={4}
                                >
                                    Lupa password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                disabled={processing}
                                className="text-brand-ink border-auth-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 h-10 rounded-lg bg-white/70 pr-10 placeholder:text-black/40"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                aria-controls="password"
                                onClick={() => setShowPassword(!showPassword)}
                                className="hover:text-brand-primary focus-visible:outline-brand-primary absolute inset-y-0 right-0 flex w-10 items-center justify-center text-black/45 transition focus-visible:outline-2"
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            tabIndex={3}
                            className="border-auth-border data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary"
                        />
                        <Label htmlFor="remember" className="text-xs font-normal text-black/65">
                            Ingat saya
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="bg-auth-action hover:bg-brand-primary h-10 w-full rounded-lg font-semibold text-white"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Memproses...' : 'Masuk'}
                    </Button>
                </div>

                <GoogleSignInButton />

                <div className="text-center text-sm text-black/55">
                    Belum punya akun?{' '}
                    <TextLink href={route('register')} className="text-brand-primary font-semibold" tabIndex={6}>
                        Daftar
                    </TextLink>
                </div>
            </form>

            {status && (
                <div role="status" className="text-brand-primary mt-4 text-center text-sm font-medium">
                    {status}
                </div>
            )}
            {googleError && (
                <div role="alert" className="mt-4 text-center text-sm font-medium text-red-700">
                    {googleError}
                </div>
            )}
        </AuthEntryLayout>
    );
}
