import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthEntryLayout from '@/layouts/auth/auth-entry-layout';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    institution: string;
    city: string;
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
        institution: '',
        city: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('register.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <AuthEntryLayout title="Buat Akun Pembeli" description="Daftar untuk membeli dan mengunduh template Excel." size="register">
            <Head title="Daftar Pembeli" />
            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-brand-ink text-sm font-medium">
                            Nama
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Nama lengkap kamu"
                            className="text-brand-ink border-auth-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 h-10 rounded-lg bg-white/70 placeholder:text-black/40"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-brand-ink text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="text-brand-ink border-auth-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 h-10 rounded-lg bg-white/70 placeholder:text-black/40"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-brand-ink text-sm font-medium">
                            No. Telepon
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            required
                            tabIndex={3}
                            autoComplete="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={processing}
                            placeholder="08xxxxxxxxxx"
                            className="text-brand-ink border-auth-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 h-10 rounded-lg bg-white/70 placeholder:text-black/40"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="institution" className="text-brand-ink text-sm font-medium">
                            Instansi
                        </Label>
                        <Input
                            id="institution"
                            required
                            tabIndex={4}
                            autoComplete="organization"
                            value={data.institution}
                            onChange={(e) => setData('institution', e.target.value)}
                            disabled={processing}
                            placeholder="Nama instansi"
                            className="text-brand-ink border-auth-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 h-10 rounded-lg bg-white/70 placeholder:text-black/40"
                        />
                        <InputError message={errors.institution} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="city" className="text-brand-ink text-sm font-medium">
                            Kota Domisili
                        </Label>
                        <Input
                            id="city"
                            required
                            tabIndex={5}
                            autoComplete="address-level2"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            disabled={processing}
                            placeholder="Kota domisili"
                            className="text-brand-ink border-auth-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 h-10 rounded-lg bg-white/70 placeholder:text-black/40"
                        />
                        <InputError message={errors.city} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-brand-ink text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={6}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Password"
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

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-brand-ink text-sm font-medium">
                            Konfirmasi password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                required
                                tabIndex={7}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Konfirmasi password"
                                className="text-brand-ink border-auth-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 h-10 rounded-lg bg-white/70 pr-10 placeholder:text-black/40"
                            />
                            <button
                                type="button"
                                aria-label={showPasswordConfirmation ? 'Sembunyikan password' : 'Tampilkan password'}
                                aria-controls="password_confirmation"
                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                className="hover:text-brand-primary focus-visible:outline-brand-primary absolute inset-y-0 right-0 flex w-10 items-center justify-center text-black/45 transition focus-visible:outline-2"
                            >
                                {showPasswordConfirmation ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <HoverBorderGradient
                        type="submit"
                        containerClassName="h-10 w-full rounded-lg focus-visible:outline-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60"
                        className="bg-auth-action hover:bg-brand-primary h-full w-full rounded-lg font-semibold text-white transition-colors"
                        tabIndex={8}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Memproses...' : 'Buat akun'}
                    </HoverBorderGradient>
                </div>

                <div className="text-center text-sm text-black/55">
                    Sudah memiliki akun?{' '}
                    <TextLink href={route('login')} className="text-brand-primary font-semibold" tabIndex={9}>
                        Masuk
                    </TextLink>
                </div>
            </form>
        </AuthEntryLayout>
    );
}
