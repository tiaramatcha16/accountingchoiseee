<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/products', [
            'products' => Product::query()->with('creator:id,name')->latest()->paginate(15),
            'status' => request()->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:10000'],
            'price' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:20480'],
        ]);

        $file = $validated['file'];
        $filePath = $file->store('excel-templates', 'local');
        abort_unless($filePath, 500, 'File template gagal disimpan.');

        $baseSlug = Str::slug($validated['title']) ?: 'template';
        $slug = $baseSlug;
        for ($suffix = 1; Product::where('slug', $slug)->exists(); $suffix++) {
            $slug = $baseSlug.'-'.$suffix;
        }

        Product::create([
            'created_by' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'file_path' => $filePath,
            'original_filename' => $file->getClientOriginalName(),
            'status' => Product::STATUS_DRAFT,
        ]);

        return to_route('admin.products.index')->with('status', 'Template tersimpan sebagai draft. Periksa file dan deskripsi sebelum menerbitkannya.');
    }

    public function updateStatus(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([Product::STATUS_DRAFT, Product::STATUS_PUBLISHED, Product::STATUS_ARCHIVED])],
        ]);

        $status = $validated['status'];
        $product->update([
            'status' => $status,
            'published_at' => $status === Product::STATUS_PUBLISHED
                ? ($product->published_at ?? now())
                : null,
        ]);

        return back()->with('status', 'Status template diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->orderItems()->exists()) {
            return back()->withErrors(['product' => 'Template tidak dapat dihapus karena sudah tercatat dalam pesanan. Arsipkan produk sebagai gantinya.']);
        }

        Storage::disk('local')->delete($product->file_path);
        $product->delete();

        return back()->with('status', 'Template dan file privatnya berhasil dihapus.');
    }
}
