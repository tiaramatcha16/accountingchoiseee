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
        $slug = Str::slug($validated['title']);
        $baseSlug = $slug ?: 'template';
        $suffix = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix++;
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

        return to_route('admin.products.index')->with('status', 'Template tersimpan sebagai draft. Terbitkan setelah memeriksa file dan deskripsinya.');
    }

    public function updateStatus(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([Product::STATUS_DRAFT, Product::STATUS_PUBLISHED, Product::STATUS_ARCHIVED])],
        ]);

        $product->update(['status' => $validated['status']]);

        return back()->with('status', 'Status template diperbarui.');
    }
}
