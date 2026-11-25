import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Filter, Search, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { FormEvent } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    email_verified_at: string | null;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function AdminUsers({
    users,
    filters,
    status,
}: {
    users: Paginated<User>;
    filters: { q?: string; role?: string };
    status?: string;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Pengguna', href: '/admin/users' },
    ];
    const { data, setData } = useForm({ q: filters.q ?? '', role: filters.role ?? '' });

    function search(event: FormEvent) {
        event.preventDefault();
        router.get('/admin/users', data, { preserveState: true });
    }

    function role(user: User, nextRole: string) {
        if (window.confirm(`Ubah role ${user.name} menjadi ${nextRole}?`)) {
            router.patch(`/admin/users/${user.id}/role`, { role: nextRole }, { preserveScroll: true });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pengguna - AccountingChoice" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-5 sm:p-6 lg:p-8">
                {/* Header */}
                <header className="border-b border-black/[0.06] pb-6">
                    <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                        Hak Akses & Pengguna
                    </span>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
                        Pengguna & Peran (Role)
                    </h1>
                    <p className="mt-1 text-sm text-[#86868b]">
                        Kelola akun pembeli terdaftar dan delegasikan hak akses penjual atau administrator.
                    </p>
                </header>

                {status && (
                    <div role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Search & Filter Bar */}
                <form onSubmit={search} className="flex flex-wrap items-center gap-3 rounded-3xl border border-black/[0.06] bg-white p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <div className="relative min-w-64 flex-1">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
                        <input
                            aria-label="Cari pengguna"
                            placeholder="Cari nama atau email pengguna..."
                            className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] py-2.5 pr-4 pl-10 text-xs text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-neutral-200 placeholder:text-[#86868b]"
                            value={data.q}
                            onChange={(e) => setData('q', e.target.value)}
                        />
                    </div>
                    <select
                        aria-label="Filter role"
                        className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] py-2.5 px-3.5 text-xs font-medium text-[#1d1d1f] outline-none transition focus:border-neutral-300"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                    >
                        <option value="">Semua Peran (Role)</option>
                        <option value="buyer">Pembeli</option>
                        <option value="seller">Penjual</option>
                        <option value="admin">Administrator</option>
                    </select>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-95"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filter</span>
                    </button>
                </form>

                {/* Table Container */}
                <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-xs">
                            <thead className="border-b border-black/[0.06] bg-[#f5f5f7]/60 text-[#86868b]">
                                <tr>
                                    <th className="py-3.5 px-5 font-semibold">Profil Pengguna</th>
                                    <th className="py-3.5 px-5 font-semibold">Status Email</th>
                                    <th className="py-3.5 px-5 font-semibold">Role Aktif</th>
                                    <th className="py-3.5 px-5 font-semibold">Tindakan Ubah Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.04] text-[#1d1d1f]">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50/50 transition">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-[11px] font-semibold text-white uppercase">
                                                    {user.name.charAt(0)}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-[#1d1d1f]">{user.name}</p>
                                                    <p className="font-mono text-[11px] text-[#86868b]">{user.email}</p>
                                                    <p className="text-[10px] text-[#86868b]">
                                                        Bergabung {new Date(user.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            {user.email_verified_at ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                                                    <UserCheck className="h-3 w-3" />
                                                    Terverifikasi
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-[#86868b]">
                                                    Belum Verifikasi
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-5">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                                                    user.role === 'admin'
                                                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                                        : user.role === 'seller'
                                                          ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                                                          : 'bg-neutral-100 text-[#1d1d1f]'
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {['buyer', 'seller', 'admin']
                                                    .filter((nextRole) => nextRole !== user.role)
                                                    .map((nextRole) => (
                                                        <button
                                                            key={nextRole}
                                                            type="button"
                                                            onClick={() => role(user, nextRole)}
                                                            className="rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1d1d1f] transition hover:bg-neutral-100 active:scale-95 capitalize"
                                                        >
                                                            Jadikan {nextRole}
                                                        </button>
                                                    ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {users.data.length === 0 && (
                        <p className="p-8 text-center text-xs text-[#86868b]">Pengguna tidak ditemukan.</p>
                    )}
                </div>

                {/* Pagination */}
                {users.links.length > 3 && (
                    <nav className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                        {users.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                        link.active
                                            ? 'bg-[#1d1d1f] text-white shadow-xs'
                                            : 'border border-black/[0.08] bg-white text-[#1d1d1f] hover:bg-neutral-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : null,
                        )}
                    </nav>
                )}
            </main>
        </AppLayout>
    );
}
