import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
interface Product {
    id: number;
    title: string;
    category: string;
    price: number;
    status: string;
    download_count: number;
    published_at: string | null;
}
interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}
const money = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
export default function SellerProducts({ products, status }: { products: Paginated<Product>; status?: string }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Penjual', href: '/seller/products' },
        { title: 'Template saya', href: '/seller/products' },
    ];
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        category: '',
        description: '',
        price: '',
        file: null as File | null,
    });
    function submit(event: FormEvent) {
        event.preventDefault();
        post('/seller/products', { forceFormData: true, onSuccess: () => reset() });
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Template Saya" />
            <main className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-10">
                <header>
                    <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">Dashboard penjual</p>
                    <h1 className="mt-2 text-3xl font-bold">Template Excel saya</h1>
                    <p className="mt-2 text-gray-600">Unggah file privat. Semua template perlu ditinjau admin sebelum tampil di katalog.</p>
                </header>
                {status && (
                    <div role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">
                        {status}
                    </div>
                )}
                <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-6 md:grid-cols-2">
                    <h2 className="text-xl font-bold md:col-span-2">Ajukan template baru</h2>
                    <label className="grid gap-1 text-sm font-medium">
                        Judul
                        <input
                            required
                            maxLength={150}
                            className="rounded-lg border-gray-300"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        {errors.title && <span className="text-red-600">{errors.title}</span>}
                    </label>
                    <label className="grid gap-1 text-sm font-medium">
                        Kategori
                        <input
                            required
                            maxLength={100}
                            className="rounded-lg border-gray-300"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                        />
                        {errors.category && <span className="text-red-600">{errors.category}</span>}
                    </label>
                    <label className="grid gap-1 text-sm font-medium md:col-span-2">
                        Deskripsi
                        <textarea
                            required
                            maxLength={10000}
                            rows={3}
                            className="rounded-lg border-gray-300"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <span className="text-red-600">{errors.description}</span>}
                    </label>
                    <label className="grid gap-1 text-sm font-medium">
                        Harga (rupiah)
                        <input
                            required
                            type="number"
                            min="0"
                            max="1000000000"
                            className="rounded-lg border-gray-300"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                        />
                        {errors.price && <span className="text-red-600">{errors.price}</span>}
                    </label>
                    <label className="grid gap-1 text-sm font-medium">
                        File Excel (.xlsx/.xls, maks. 20 MB)
                        <input
                            required
                            type="file"
                            accept=".xlsx,.xls"
                            className="rounded-lg border border-gray-300 p-2"
                            onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                        />
                        {errors.file && <span className="text-red-600">{errors.file}</span>}
                    </label>
                    <button disabled={processing} className="w-fit rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">
                        {processing ? 'Mengirim...' : 'Kirim untuk ditinjau'}
                    </button>
                </form>
                <section className="overflow-x-auto rounded-2xl border bg-white">
                    <h2 className="border-b p-5 text-xl font-bold">Daftar template</h2>
                    <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4">Template</th>
                                <th className="p-4">Harga</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Unduhan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.data.map((product) => (
                                <tr key={product.id}>
                                    <td className="p-4">
                                        <strong>{product.title}</strong>
                                        <p className="text-gray-500">{product.category}</p>
                                    </td>
                                    <td className="p-4">{money(product.price)}</td>
                                    <td className="p-4 capitalize">{product.status}</td>
                                    <td className="p-4">{product.download_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.data.length === 0 && <p className="p-6 text-center text-gray-500">Belum ada template.</p>}
                </section>
                <nav className="flex gap-2">
                    {products.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                className="rounded border px-3 py-2 text-sm"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : null,
                    )}
                </nav>
            </main>
        </AppLayout>
    );
}
