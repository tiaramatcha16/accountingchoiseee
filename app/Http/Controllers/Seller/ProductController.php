<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('seller/products', [
            'products' => Product::query()->where('created_by', $request->user()->id)->latest()->paginate(15),
            'status' => $request->session()->get('status'),
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

        return to_route('seller.products.index')->with('status', 'Template dikirim sebagai draft dan perlu disetujui admin sebelum tayang.');
    }
}
