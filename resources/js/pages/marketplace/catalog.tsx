import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    price: number;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function Catalog({ products, categories, filters }: { products: Paginated<Product>; categories: string[]; filters: { q?: string; category?: string } }) {
    const [query, setQuery] = useState(filters.q ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const { auth } = usePage().props as { auth: { user: { id: number } | null } };
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Template Excel', href: '/templates' }];

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        router.get('/templates', { q: query || undefined, category: category || undefined }, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Marketplace Template Excel" />
            <main className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-10">
                <section className="rounded-3xl bg-emerald-800 p-8 text-white md:p-12">
                    <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">Marketplace</p>
                    <h1 className="mt-3 text-3xl font-bold md:text-5xl">Template Excel siap pakai</h1>
                    <p className="mt-3 max-w-2xl text-emerald-50">Temukan spreadsheet praktis untuk pekerjaan, bisnis, dan kebutuhan sehari-hari.</p>
                    <form onSubmit={submitSearch} className="mt-7 flex flex-col gap-3 rounded-2xl bg-white p-3 sm:flex-row">
                        <div className="flex flex-1 items-center gap-2 px-2 text-gray-500"><Search size={18}/><input aria-label="Cari template" className="w-full border-0 text-gray-900 outline-none focus:ring-0" placeholder="Cari template atau kategori" value={query} onChange={(e) => setQuery(e.target.value)}/></div>
                        <select aria-label="Kategori" className="rounded-xl border-gray-200 text-gray-800" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Semua kategori</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
                        <button className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white">Cari</button>
                    </form>
                </section>
                <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">Katalog template</h2><p className="mt-1 text-sm text-gray-500">{products.data.length} template pada halaman ini</p></div>{auth.user && <Link href="/my-orders" className="font-medium text-emerald-800 hover:underline">Pesanan saya</Link>}</div>
                {products.data.length === 0 ? <div className="rounded-2xl border border-dashed p-12 text-center text-gray-500">Belum ada template yang cocok. Coba kata kunci lain.</div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.data.map((product) => <article key={product.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{product.category}</span><h3 className="mt-4 text-xl font-bold">{product.title}</h3><p className="mt-2 flex-1 whitespace-pre-line text-sm leading-6 text-gray-600">{product.description}</p><div className="mt-6 flex items-center justify-between border-t pt-4"><strong className="text-lg">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}</strong>{auth.user ? <button onClick={() => router.post(`/templates/${product.id}/orders`)} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Pesan</button> : <Link href="/login" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Masuk untuk pesan</Link>}</div></article>)}</div>}
                <nav className="flex flex-wrap gap-2">{products.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg border px-3 py-2 text-sm ${link.active ? 'bg-emerald-700 text-white' : 'bg-white'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded-lg border px-3 py-2 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>
            </main>
        </AppLayout>
    );
}
