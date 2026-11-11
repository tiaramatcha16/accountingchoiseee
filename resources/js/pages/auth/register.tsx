import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
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
        name: '', email: '', phone: '', institution: '', city: '', password: '', password_confirmation: '',
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
                    <div className="grid gap-2"><Label htmlFor="name">Nama</Label><Input id="name" required autoFocus autoComplete="name" value={data.name} onChange={e => setData('name', e.target.value)} disabled={processing} placeholder="Nama lengkap"/><InputError message={errors.name}/></div>
                    <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required autoComplete="email" value={data.email} onChange={e => setData('email', e.target.value)} disabled={processing} placeholder="email@example.com"/><InputError message={errors.email}/></div>
                    <div className="grid gap-2"><Label htmlFor="phone">No. Telepon</Label><Input id="phone" type="tel" required autoComplete="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} disabled={processing} placeholder="08xxxxxxxxxx"/><InputError message={errors.phone}/></div>
                    <div className="grid gap-2"><Label htmlFor="institution">Instansi</Label><Input id="institution" required autoComplete="organization" value={data.institution} onChange={e => setData('institution', e.target.value)} disabled={processing} placeholder="Nama instansi"/><InputError message={errors.institution}/></div>
                    <div className="grid gap-2"><Label htmlFor="city">Kota Domisili</Label><Input id="city" required autoComplete="address-level2" value={data.city} onChange={e => setData('city', e.target.value)} disabled={processing} placeholder="Kota domisili"/><InputError message={errors.city}/></div>
                    <div className="grid gap-2"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={data.password} onChange={e => setData('password', e.target.value)} disabled={processing} placeholder="Password" className="pr-10"/><button type="button" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-black/45">{showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}</button></div><InputError message={errors.password}/></div>
                    <div className="grid gap-2"><Label htmlFor="password_confirmation">Konfirmasi password</Label><div className="relative"><Input id="password_confirmation" type={showPasswordConfirmation ? 'text' : 'password'} required autoComplete="new-password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} disabled={processing} placeholder="Ulangi password" className="pr-10"/><button type="button" aria-label={showPasswordConfirmation ? 'Sembunyikan password' : 'Tampilkan password'} onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-black/45">{showPasswordConfirmation ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}</button></div><InputError message={errors.password_confirmation}/></div>
                    <Button type="submit" disabled={processing} className="bg-auth-action h-10 w-full rounded-lg font-semibold text-white">{processing && <LoaderCircle className="h-4 w-4 animate-spin"/>}{processing ? 'Memproses...' : 'Buat akun pembeli'}</Button>
                </div>
                <div className="text-center text-sm text-black/55">Sudah punya akun? <TextLink href={route('login')} className="text-brand-primary font-semibold">Masuk</TextLink></div>
            </form>
        </AuthEntryLayout>
    );
}
