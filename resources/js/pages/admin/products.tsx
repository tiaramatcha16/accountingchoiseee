import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Archive,
    Check,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    FileSpreadsheet,
    Filter,
    Layers,
    LoaderCircle,
    Plus,
    Search,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { getCsrfHeaders } from '@/lib/csrf';
import { type BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    usage_guide: string | null;
    price: number;
    original_filename: string | null;
    google_sheet_id: string | null;
    status: 'draft' | 'published' | 'archived';
    download_count: number;
    published_at: string | null;
    creator?: { id: number; name: string };
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Stats {
    total: number;
    published: number;
    draft: number;
    downloads: number;
}

interface Props {
    products: Paginated<Product>;
    stats: Stats;
    categories: string[];
    filters: { q?: string; status?: string; category?: string };
    status?: string;
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

const quickCategories = ['UMKM & Bisnis', 'Keuangan Personal', 'Perpajakan', 'Freelancer'];

export default function AdminProducts({ products, stats, categories, filters, status }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Kelola Template', href: '/admin/products' },
    ];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.q ?? '');
    const [filterCategory, setFilterCategory] = useState(filters.category ?? '');
    const [filterStatus, setFilterStatus] = useState(filters.status ?? '');
    const [generatingTarget, setGeneratingTarget] = useState<'create' | 'edit' | 'create-guide' | 'edit-guide' | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [guideGenerationError, setGuideGenerationError] = useState<string | null>(null);
    const [createGuideNotes, setCreateGuideNotes] = useState('');
    const [editGuideNotes, setEditGuideNotes] = useState('');
    const [guideRequiredNotice, setGuideRequiredNotice] = useState(false);
    const generationInProgress = useRef(false);
    // Create form
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: isCreating,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({
        title: '',
        category: 'UMKM & Bisnis',
        description: '',
        usage_guide: '',
        price: '',
        spreadsheet_url: '',
        status: 'published' as 'draft' | 'published',
    });

    // Edit form
    const {
        data: editData,
        setData: setEditData,
        patch: patchEdit,
        processing: isEditing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        title: '',
        category: '',
        description: '',
        usage_guide: '',
        price: '',
        spreadsheet_url: '',
        status: 'published' as 'draft' | 'published' | 'archived',
    });

    const handleCreateSubmit = (e: FormEvent) => {
        e.preventDefault();
        postCreate(route('admin.products.store'), {
            onSuccess: () => {
                resetCreate();
                setCreateGuideNotes('');
                setIsCreateOpen(false);
            },
        });
    };

    const openEditModal = (product: Product, publishAfterEdit = false) => {
        setEditingProduct(product);
        setGuideRequiredNotice(publishAfterEdit);
        setEditGuideNotes('');
        setEditData({
            title: product.title,
            category: product.category,
            description: product.description,
            usage_guide: product.usage_guide ?? '',
            price: product.price.toString(),
            spreadsheet_url: product.google_sheet_id ? `https://docs.google.com/spreadsheets/d/${product.google_sheet_id}/edit` : '',
            status: publishAfterEdit ? 'published' : product.status,
        });
    };

    const handleEditSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        patchEdit(route('admin.products.update', editingProduct.id), {
            onSuccess: () => {
                setEditingProduct(null);
                setGuideRequiredNotice(false);
                setEditGuideNotes('');
                resetEdit();
            },
        });
    };

    const generateDetails = async (target: 'create' | 'edit') => {
        if (generationInProgress.current) {
            return;
        }

        const spreadsheetUrl = target === 'create' ? createData.spreadsheet_url : editData.spreadsheet_url;
        if (!spreadsheetUrl.trim()) {
            setGenerationError('Masukkan link Google Sheets terlebih dahulu.');
            return;
        }

        const csrfHeaders = getCsrfHeaders();
        if (!csrfHeaders) {
            setGenerationError('Token keamanan tidak ditemukan. Muat ulang halaman lalu coba kembali.');
            return;
        }

        generationInProgress.current = true;
        setGeneratingTarget(target);
        setGenerationError(null);
        try {
            const response = await fetch(route('admin.products.generate-details'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...csrfHeaders,
                },
                body: JSON.stringify({ spreadsheet_url: spreadsheetUrl }),
            });
            const result = (await response.json()) as {
                title?: string;
                description?: string;
                features?: string[];
                message?: string;
            };

            if (!response.ok) {
                throw new Error(result.message ?? 'AI belum dapat membaca spreadsheet. Periksa akses dan konfigurasi, lalu coba lagi.');
            }

            if (
                typeof result.title !== 'string' ||
                typeof result.description !== 'string' ||
                !Array.isArray(result.features) ||
                result.features.some((feature) => typeof feature !== 'string')
            ) {
                throw new Error('AI mengembalikan format yang tidak dapat digunakan. Silakan coba kembali.');
            }

            const description = [result.description, 'Fitur utama:', ...result.features.map((feature) => `- ${feature}`)].join('\n');
            if (target === 'create') {
                setCreateData('title', result.title);
                setCreateData('description', description);
            } else {
                setEditData('title', result.title);
                setEditData('description', description);
            }
        } catch (error) {
            setGenerationError(error instanceof Error ? error.message : 'AI belum dapat membuat deskripsi. Silakan coba kembali.');
        } finally {
            generationInProgress.current = false;
            setGeneratingTarget(null);
        }
    };

    const generateUsageGuide = async (target: 'create' | 'edit') => {
        if (generationInProgress.current) {
            return;
        }

        const formData = target === 'create' ? createData : editData;
        const adminNotes = target === 'create' ? createGuideNotes : editGuideNotes;
        if (!formData.title.trim() || !formData.category.trim()) {
            setGuideGenerationError('Isi judul dan kategori template terlebih dahulu.');
            return;
        }

        const csrfHeaders = getCsrfHeaders();
        if (!csrfHeaders) {
            setGuideGenerationError('Token keamanan tidak ditemukan. Muat ulang halaman lalu coba kembali.');
            return;
        }

        generationInProgress.current = true;
        setGeneratingTarget(target === 'create' ? 'create-guide' : 'edit-guide');
        setGuideGenerationError(null);
        try {
            const response = await fetch(route('admin.products.generate-usage-guide'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...csrfHeaders,
                },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    description: formData.description,
                    admin_notes: adminNotes,
                    spreadsheet_url: formData.spreadsheet_url || undefined,
                }),
            });
            const result = (await response.json()) as { usage_guide?: string; message?: string };
            if (!response.ok) {
                throw new Error(result.message ?? 'AI belum dapat membuat draft panduan. Periksa input dan konfigurasi, lalu coba lagi.');
            }
            if (typeof result.usage_guide !== 'string' || result.usage_guide.trim().length < 30) {
                throw new Error('AI mengembalikan draft panduan yang belum lengkap. Tambahkan catatan lalu coba kembali.');
            }

            if (target === 'create') {
                setCreateData('usage_guide', result.usage_guide);
            } else {
                setEditData('usage_guide', result.usage_guide);
            }
        } catch (error) {
            setGuideGenerationError(error instanceof Error ? error.message : 'AI belum dapat membuat draft panduan. Silakan coba kembali.');
        } finally {
            generationInProgress.current = false;
            setGeneratingTarget(null);
        }
    };

    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.products.index'),
            {
                q: searchQuery || undefined,
                category: filterCategory || undefined,
                status: filterStatus || undefined,
            },
            { preserveState: true },
        );
    };

    const toggleStatus = (product: Product) => {
        const nextStatus = product.status === 'published' ? 'draft' : 'published';
        if (nextStatus === 'published' && !product.usage_guide?.trim()) {
            openEditModal(product, true);
            return;
        }
        router.patch(route('admin.products.status', product.id), { status: nextStatus }, { preserveScroll: true });
    };

    const handleDelete = (product: Product) => {
        if (confirm(`Apakah Anda yakin ingin menghapus template "${product.title}"?`)) {
            router.delete(route('admin.products.destroy', product.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Template Excel - Admin" />

            <main className="mx-auto w-full max-w-7xl space-y-8 p-6 lg:p-10">
                {/* Header & Main Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold tracking-widest text-emerald-700 uppercase">
                            Manajemen Toko
                        </span>
                        <h1 className="font-heading mt-2.5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Kelola Template Excel</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Kelola template, link master Google Sheets, dan panduan AI yang tampil untuk pembeli setelah pembayaran berhasil.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary hover:bg-brand-primary-dark shadow-brand-primary/20 flex h-11 items-center gap-2 rounded-xl px-5 font-bold text-white shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Template
                    </Button>
                </div>

                {/* Status Message */}
                {status && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-xs"
                    >
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="text-xs font-semibold">Total Template</span>
                            <Layers className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="font-heading mt-3 text-2xl font-extrabold text-gray-900">{stats.total}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="text-xs font-semibold">Aktif Tayang</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="font-heading mt-3 text-2xl font-extrabold text-emerald-700">{stats.published}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="text-xs font-semibold">Draft Belum Tayang</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="font-heading mt-3 text-2xl font-extrabold text-amber-600">{stats.draft}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="text-xs font-semibold">Total Unduhan</span>
                            <Download className="text-brand-gold-dark h-4 w-4" />
                        </div>
                        <p className="font-heading text-brand-gold-dark mt-3 text-2xl font-extrabold">{stats.downloads}</p>
                    </div>
                </div>

                {/* Upload Form Card (Expandable / Inline) */}
                {isCreateOpen && (
                    <section className="animate-in fade-in slide-in-from-top-4 rounded-3xl border border-emerald-600/30 bg-gradient-to-b from-emerald-50/40 via-white to-white p-6 shadow-md duration-300 md:p-8">
                        <div className="flex items-start justify-between border-b border-gray-100 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/20">
                                    <FileSpreadsheet className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="font-heading text-lg font-bold text-gray-900">Tambah Template Google Sheets</h2>
                                    <p className="text-xs text-gray-500">
                                        Masukkan link master. Sistem akan membuat salinan terpisah untuk pembeli setelah pembayaran terverifikasi.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Judul */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="title" className="text-xs font-bold text-gray-700">
                                    Judul Template Spreadsheet <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    required
                                    maxLength={150}
                                    placeholder="Contoh: Template Laporan Keuangan UMKM 3-in-1 Otomatis"
                                    value={createData.title}
                                    onChange={(e) => setCreateData('title', e.target.value)}
                                    className="focus-visible:border-brand-primary h-10 rounded-xl border-gray-200"
                                />
                                {createErrors.title && <p className="text-xs text-red-600">{createErrors.title}</p>}
                            </div>

                            {/* Kategori */}
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-xs font-bold text-gray-700">
                                    Kategori <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="category"
                                    required
                                    maxLength={100}
                                    placeholder="Pilih atau ketik kategori..."
                                    value={createData.category}
                                    onChange={(e) => setCreateData('category', e.target.value)}
                                    className="focus-visible:border-brand-primary h-10 rounded-xl border-gray-200"
                                />
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {quickCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCreateData('category', cat)}
                                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                                createData.category === cat
                                                    ? 'bg-emerald-700 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                {createErrors.category && <p className="text-xs text-red-600">{createErrors.category}</p>}
                            </div>

                            {/* Harga */}
                            <div className="grid gap-2">
                                <Label htmlFor="price" className="text-xs font-bold text-gray-700">
                                    Harga (Rupiah) <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                                    <Input
                                        id="price"
                                        required
                                        type="number"
                                        min="0"
                                        max="1000000000"
                                        placeholder="49000"
                                        value={createData.price}
                                        onChange={(e) => setCreateData('price', e.target.value)}
                                        className="focus-visible:border-brand-primary h-10 rounded-xl border-gray-200 pl-10 font-bold text-gray-900"
                                    />
                                </div>
                                {createErrors.price && <p className="text-xs text-red-600">{createErrors.price}</p>}
                            </div>

                            {/* Deskripsi */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="description" className="text-xs font-bold text-gray-700">
                                    Deskripsi & Fitur Template <span className="text-red-500">*</span>
                                </Label>
                                <textarea
                                    id="description"
                                    required
                                    rows={3}
                                    maxLength={10000}
                                    placeholder="Jelaskan kegunaan spreadsheet, fitur otomatis rumus, petunjuk pemakaian, dll..."
                                    value={createData.description}
                                    onChange={(e) => setCreateData('description', e.target.value)}
                                    className="focus:border-brand-primary focus:ring-brand-primary w-full rounded-xl border border-gray-200 p-3 text-xs leading-relaxed text-gray-900 focus:ring-1 focus:outline-none"
                                />
                                {createErrors.description && <p className="text-xs text-red-600">{createErrors.description}</p>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="usage_guide" className="text-xs font-bold text-gray-700">
                                    Panduan Penggunaan untuk AI {createData.status === 'published' && <span className="text-red-500">*</span>}
                                </Label>
                                <textarea
                                    id="usage_guide"
                                    required={createData.status === 'published'}
                                    minLength={createData.status === 'published' ? 30 : undefined}
                                    maxLength={12000}
                                    rows={6}
                                    placeholder={
                                        'Contoh:\n1. Buat salinan template terlebih dahulu.\n2. Isi tanggal dan keterangan transaksi pada kolom yang tersedia.\n3. Kolom total dihitung otomatis dan tidak perlu diubah.'
                                    }
                                    value={createData.usage_guide}
                                    onChange={(e) => setCreateData('usage_guide', e.target.value)}
                                    className="focus:border-brand-primary focus:ring-brand-primary w-full rounded-xl border border-gray-200 p-3 text-xs leading-relaxed text-gray-900 focus:ring-1 focus:outline-none"
                                />
                                <p className="text-[11px] leading-5 text-gray-500">
                                    Tulis langkah awal, cara mengisi, arti kolom, dan fitur otomatis. Jawaban AI hanya boleh bersumber dari teks ini.
                                    Jangan masukkan link master, data pembeli, password, atau informasi rahasia.
                                </p>
                                {createErrors.usage_guide && <p className="text-xs text-red-600">{createErrors.usage_guide}</p>}
                                <Label htmlFor="create-guide-notes" className="mt-2 text-xs font-bold text-gray-700">
                                    Catatan untuk AI (opsional)
                                </Label>
                                <textarea
                                    id="create-guide-notes"
                                    maxLength={3000}
                                    rows={2}
                                    value={createGuideNotes}
                                    onChange={(e) => setCreateGuideNotes(e.target.value)}
                                    placeholder="Contoh: input transaksi harian di tab Transaksi; ringkasan ada di tab Dashboard."
                                    className="w-full rounded-xl border border-gray-200 p-3 text-xs leading-relaxed text-gray-900"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={generatingTarget !== null}
                                    onClick={() => void generateUsageGuide('create')}
                                    className="w-fit rounded-xl text-xs"
                                >
                                    {generatingTarget === 'create-guide' ? (
                                        <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {generatingTarget === 'create-guide' ? 'Menyusun draft panduan...' : 'Buat draft panduan dengan AI'}
                                </Button>
                                <p className="text-[11px] leading-5 text-gray-500">
                                    Jika link Google Sheets diisi, AI hanya membaca nama tab dan judul kolom pada baris pertama—bukan data transaksi.
                                    Deskripsi dan catatan ini dikirim ke Gemini. Periksa dan edit draft sebelum menyimpan.
                                </p>
                                {guideGenerationError && (
                                    <p role="alert" className="text-xs text-red-600">
                                        {guideGenerationError}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="spreadsheet_url" className="text-xs font-bold text-gray-700">
                                    Link Google Sheets master <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="spreadsheet_url"
                                    type="url"
                                    required
                                    maxLength={2048}
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    value={createData.spreadsheet_url}
                                    onChange={(event) => setCreateData('spreadsheet_url', event.target.value)}
                                    onBlur={() => {
                                        if (!createData.title.trim() && !createData.description.trim() && createData.spreadsheet_url.trim()) {
                                            void generateDetails('create');
                                        }
                                    }}
                                    className="focus-visible:border-brand-primary h-10 rounded-xl border-gray-200"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={generatingTarget !== null}
                                    onClick={() => void generateDetails('create')}
                                    className="w-fit rounded-xl text-xs"
                                >
                                    {generatingTarget === 'create' ? (
                                        <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {generatingTarget === 'create' ? 'Menganalisis spreadsheet...' : 'Buat judul & deskripsi dengan AI'}
                                </Button>
                                <p className="text-[11px] leading-5 text-gray-500">
                                    Pastikan akun Google Drive yang terhubung ke aplikasi memiliki akses ke spreadsheet ini. Master tidak dibagikan
                                    kepada pembeli; salinan baru akan dibuat setelah pembayaran terverifikasi. AI hanya membaca sampel hingga 6 tab,
                                    40 baris, dan 20 kolom, lalu mengirim label serta rumus ke Gemini. Jangan gunakan pada sheet berisi data rahasia.
                                </p>
                                {generationError && (
                                    <p role="alert" className="text-xs text-red-600">
                                        {generationError}
                                    </p>
                                )}
                                {createErrors.spreadsheet_url && <p className="text-xs text-red-600">{createErrors.spreadsheet_url}</p>}
                            </div>

                            {/* Status Publish */}
                            <div className="flex items-center gap-3 pt-2 md:col-span-2">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={createData.status === 'published'}
                                        onChange={(e) => setCreateData('status', e.target.checked ? 'published' : 'draft')}
                                        className="text-brand-primary focus:ring-brand-primary h-4 w-4 rounded border-gray-300"
                                    />
                                    <span className="text-xs font-bold text-gray-800">Langsung terbitkan ke etalase toko (Published)</span>
                                </label>
                                <span className="text-xs text-gray-400">(Jika tidak dicentang, akan disimpan sebagai draft terlebih dahulu)</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 md:col-span-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-xl border-gray-300 text-xs font-bold"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="bg-brand-primary hover:bg-brand-primary-dark h-10 rounded-xl px-6 text-xs font-bold text-white shadow-sm"
                                >
                                    {isCreating && <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />}
                                    {isCreating ? 'Menyimpan...' : 'Simpan Template'}
                                </Button>
                            </div>
                        </form>
                    </section>
                )}

                {/* Filter & Search Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleFilterSubmit} className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari judul template atau kategori..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="focus-visible:border-brand-primary h-9 rounded-xl border-gray-200 pl-9 text-xs"
                            />
                        </div>

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700"
                        >
                            <option value="">Semua Status</option>
                            <option value="published">Tayang (Published)</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Diarsipkan</option>
                        </select>

                        <Button type="submit" variant="secondary" className="h-9 rounded-xl px-4 text-xs font-bold">
                            <Filter className="mr-1.5 h-3.5 w-3.5" />
                            Filter
                        </Button>
                    </form>

                    <div className="text-xs font-medium text-gray-500">
                        Menampilkan {products.data.length} dari {products.total} template
                    </div>
                </div>

                {/* Products Table Card */}
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xs">
                    {products.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                                <FileSpreadsheet className="h-7 w-7" />
                            </div>
                            <h3 className="font-heading text-base font-bold text-gray-900">Belum ada template</h3>
                            <p className="mt-1 text-xs text-gray-500">Tambahkan link master Google Sheets pertama Anda.</p>
                            <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-primary mt-5 rounded-xl text-xs font-bold text-white">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Tambah Sekarang
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-xs">
                                <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-extrabold tracking-wider text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Informasi Template</th>
                                        <th className="px-4 py-4">Harga</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-4 py-4">Panduan AI</th>
                                        <th className="px-4 py-4 text-center">Unduhan</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="transition hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/60 text-emerald-800">
                                                        <FileSpreadsheet className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-heading line-clamp-1 text-xs font-bold text-gray-900">{product.title}</h4>
                                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                                                            <span className="rounded-md bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
                                                                {product.category}
                                                            </span>
                                                            <span>·</span>
                                                            {product.google_sheet_id ? (
                                                                <a
                                                                    href={`https://docs.google.com/spreadsheets/d/${product.google_sheet_id}/edit`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-semibold text-emerald-700 underline"
                                                                >
                                                                    Master Google Sheets
                                                                </a>
                                                            ) : (
                                                                <span className="font-mono text-gray-400">
                                                                    {product.original_filename ?? 'File Excel dari penjual'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="font-heading text-brand-primary px-4 py-4 text-sm font-extrabold">
                                                {formatRupiah(product.price)}
                                            </td>

                                            <td className="px-4 py-4">
                                                {product.status === 'published' ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                                        <Check className="h-3 w-3" />
                                                        Tayang
                                                    </span>
                                                ) : product.status === 'draft' ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                                        <Clock className="h-3 w-3" />
                                                        Draft
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                                                        <Archive className="h-3 w-3" />
                                                        Arsip
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                {product.usage_guide?.trim() ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Siap
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                                        <Clock className="h-3 w-3" />
                                                        Perlu diisi
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                <span className="font-bold text-gray-700">{product.download_count}</span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleStatus(product)}
                                                        title={product.status === 'published' ? 'Jadikan Draft' : 'Terbitkan ke Toko'}
                                                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-emerald-700"
                                                    >
                                                        {product.status === 'published' ? (
                                                            <Clock className="h-4 w-4" />
                                                        ) : (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        )}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(product)}
                                                        title="Edit Template"
                                                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(product)}
                                                        title="Hapus Template"
                                                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {products.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                        {products.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-brand-primary text-white shadow-xs'
                                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-400 opacity-60"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </div>
                )}
            </main>

            {/* Edit Modal */}
            <Dialog
                open={!!editingProduct}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingProduct(null);
                        setGuideRequiredNotice(false);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-lg font-bold text-gray-900">Edit Template Spreadsheet</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Perbarui detail template dan panduan AI yang akan membantu pembeli setelah pembayaran.
                        </DialogDescription>
                    </DialogHeader>

                    {editingProduct && (
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            {guideRequiredNotice && (
                                <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                                    Tambahkan panduan penggunaan minimal 30 karakter sebelum template ini bisa diterbitkan.
                                </div>
                            )}
                            <div className="grid gap-1.5">
                                <Label htmlFor="edit-title" className="text-xs font-bold text-gray-700">
                                    Judul Template
                                </Label>
                                <Input
                                    id="edit-title"
                                    required
                                    value={editData.title}
                                    onChange={(e) => setEditData('title', e.target.value)}
                                    className="h-9 rounded-xl border-gray-200 text-xs"
                                />
                                {editErrors.title && <p className="text-xs text-red-600">{editErrors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="edit-category" className="text-xs font-bold text-gray-700">
                                        Kategori
                                    </Label>
                                    <Input
                                        id="edit-category"
                                        required
                                        value={editData.category}
                                        onChange={(e) => setEditData('category', e.target.value)}
                                        className="h-9 rounded-xl border-gray-200 text-xs"
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="edit-price" className="text-xs font-bold text-gray-700">
                                        Harga (Rp)
                                    </Label>
                                    <Input
                                        id="edit-price"
                                        required
                                        type="number"
                                        value={editData.price}
                                        onChange={(e) => setEditData('price', e.target.value)}
                                        className="h-9 rounded-xl border-gray-200 text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="edit-status" className="text-xs font-bold text-gray-700">
                                    Status Publikasi
                                </Label>
                                <select
                                    id="edit-status"
                                    value={editData.status}
                                    onChange={(e) => setEditData('status', e.target.value as 'draft' | 'published' | 'archived')}
                                    className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800"
                                >
                                    <option value="published">Tayang di Toko (Published)</option>
                                    <option value="draft">Simpan sebagai Draft</option>
                                    <option value="archived">Diarsipkan (Archived)</option>
                                </select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="edit-desc" className="text-xs font-bold text-gray-700">
                                    Deskripsi Template
                                </Label>
                                <textarea
                                    id="edit-desc"
                                    required
                                    rows={3}
                                    value={editData.description}
                                    onChange={(e) => setEditData('description', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-800"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="edit-usage-guide" className="text-xs font-bold text-gray-700">
                                    Panduan Penggunaan untuk AI
                                </Label>
                                <textarea
                                    id="edit-usage-guide"
                                    required={editData.status === 'published'}
                                    minLength={editData.status === 'published' ? 30 : undefined}
                                    maxLength={12000}
                                    rows={6}
                                    value={editData.usage_guide}
                                    onChange={(e) => setEditData('usage_guide', e.target.value)}
                                    placeholder={
                                        'Contoh:\n1. Buat salinan template terlebih dahulu.\n2. Isi tanggal dan keterangan transaksi pada kolom yang tersedia.\n3. Kolom total dihitung otomatis dan tidak perlu diubah.'
                                    }
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs leading-5 text-gray-800"
                                />
                                <p className="text-[11px] leading-5 text-gray-500">
                                    Isi langkah awal, arti kolom, dan bagian yang otomatis. Jawaban AI hanya boleh bersumber dari teks ini. Jangan
                                    masukkan link master, data pembeli, password, atau informasi rahasia.
                                </p>
                                {editErrors.usage_guide && <p className="text-xs text-red-600">{editErrors.usage_guide}</p>}
                                <Label htmlFor="edit-guide-notes" className="mt-2 text-xs font-bold text-gray-700">
                                    Catatan untuk AI (opsional)
                                </Label>
                                <textarea
                                    id="edit-guide-notes"
                                    maxLength={3000}
                                    rows={2}
                                    value={editGuideNotes}
                                    onChange={(e) => setEditGuideNotes(e.target.value)}
                                    placeholder="Contoh: input transaksi harian di tab Transaksi; ringkasan ada di tab Dashboard."
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs leading-5 text-gray-800"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={generatingTarget !== null}
                                    onClick={() => void generateUsageGuide('edit')}
                                    className="w-fit rounded-xl text-xs"
                                >
                                    {generatingTarget === 'edit-guide' ? (
                                        <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {generatingTarget === 'edit-guide' ? 'Menyusun draft panduan...' : 'Buat draft panduan dengan AI'}
                                </Button>
                                <p className="text-[11px] leading-5 text-gray-500">
                                    Jika link Google Sheets diisi, AI hanya membaca nama tab dan judul kolom pada baris pertama—bukan data transaksi.
                                    Deskripsi dan catatan ini dikirim ke Gemini. Periksa dan edit draft sebelum menyimpan.
                                </p>
                                {guideGenerationError && (
                                    <p role="alert" className="text-xs text-red-600">
                                        {guideGenerationError}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="edit-spreadsheet-url" className="text-xs font-bold text-gray-700">
                                    Link Google Sheets master (opsional)
                                </Label>
                                <Input
                                    id="edit-spreadsheet-url"
                                    type="url"
                                    maxLength={2048}
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    value={editData.spreadsheet_url}
                                    onChange={(event) => setEditData('spreadsheet_url', event.target.value)}
                                    className="h-9 rounded-xl border-gray-200 text-xs"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={generatingTarget !== null}
                                    onClick={() => void generateDetails('edit')}
                                    className="w-fit rounded-xl text-xs"
                                >
                                    {generatingTarget === 'edit' ? (
                                        <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {generatingTarget === 'edit' ? 'Menganalisis spreadsheet...' : 'Buat ulang judul & deskripsi dengan AI'}
                                </Button>
                                <p className="text-[11px] leading-5 text-gray-500">
                                    Hasil AI mengisi judul dan deskripsi yang tetap dapat diedit sebelum disimpan. Mengganti link tidak mengubah
                                    produk sampai Anda menyimpan formulir.
                                </p>
                                {generationError && (
                                    <p role="alert" className="text-xs text-red-600">
                                        {generationError}
                                    </p>
                                )}
                                {editErrors.spreadsheet_url && <p className="text-xs text-red-600">{editErrors.spreadsheet_url}</p>}
                            </div>

                            <DialogFooter className="gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setGuideRequiredNotice(false);
                                    }}
                                    className="rounded-xl text-xs"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isEditing} className="bg-brand-primary rounded-xl px-5 text-xs font-bold text-white">
                                    {isEditing && <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                    Simpan Perubahan
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
