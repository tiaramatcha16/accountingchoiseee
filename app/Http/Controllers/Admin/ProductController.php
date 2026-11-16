<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\GoogleSheetsDescriptionException;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\GoogleSheetsProductDetailsService;
use App\Support\GoogleSheetsLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with('creator:id,name')
            ->when($request->filled('q'), function ($query) use ($request) {
                $search = $request->string('q')->toString();
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('original_filename', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->string('category')))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product) => $product->makeVisible(['google_sheet_id', 'usage_guide']));

        $stats = [
            'total' => Product::count(),
            'published' => Product::where('status', Product::STATUS_PUBLISHED)->count(),
            'draft' => Product::where('status', Product::STATUS_DRAFT)->count(),
            'downloads' => (int) Product::sum('download_count'),
        ];

        $categories = Product::select('category')->distinct()->pluck('category');

        return Inertia::render('admin/products', [
            'products' => $products,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => $request->only(['q', 'status', 'category']),
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
            'spreadsheet_url' => ['required', 'url', 'max:2048'],
            'status' => ['nullable', Rule::in([Product::STATUS_DRAFT, Product::STATUS_PUBLISHED])],
            'usage_guide' => [
                Rule::requiredIf(fn () => ($request->input('status') ?? Product::STATUS_PUBLISHED) === Product::STATUS_PUBLISHED),
                'nullable',
                'string',
                'min:30',
                'max:12000',
            ],
        ]);

        $googleSheetId = $this->spreadsheetId($validated['spreadsheet_url']);

        $baseSlug = Str::slug($validated['title']) ?: 'template';
        $slug = $baseSlug;
        for ($suffix = 1; Product::where('slug', $slug)->exists(); $suffix++) {
            $slug = $baseSlug.'-'.$suffix;
        }

        $status = $validated['status'] ?? Product::STATUS_PUBLISHED;

        Product::create([
            'created_by' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'google_sheet_id' => $googleSheetId,
            'usage_guide' => $validated['usage_guide'] ?? null,
            'status' => $status,
            'published_at' => $status === Product::STATUS_PUBLISHED ? now() : null,
        ]);

        $message = $status === Product::STATUS_PUBLISHED
            ? 'Template Google Sheets berhasil ditambahkan dan langsung diterbitkan ke katalog toko!'
            : 'Template Google Sheets tersimpan sebagai draft.';

        return to_route('admin.products.index')->with('status', $message);
    }

    public function generateDetails(Request $request, GoogleSheetsProductDetailsService $details): JsonResponse
    {
        $validated = $request->validate([
            'spreadsheet_url' => ['required', 'url', 'max:2048'],
        ]);
        $spreadsheetId = GoogleSheetsLink::spreadsheetId($validated['spreadsheet_url']);

        if ($spreadsheetId === null) {
            return response()->json([
                'message' => 'Masukkan link Google Sheets yang valid.',
            ], 422);
        }

        try {
            return response()->json($details->generate($spreadsheetId));
        } catch (GoogleSheetsDescriptionException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 503);
        }
    }

    public function generateUsageGuide(Request $request, GoogleSheetsProductDetailsService $details): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:10000'],
            'admin_notes' => ['nullable', 'string', 'max:3000'],
            'spreadsheet_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $spreadsheetId = filled($validated['spreadsheet_url'] ?? null)
            ? GoogleSheetsLink::spreadsheetId($validated['spreadsheet_url'])
            : null;

        if (filled($validated['spreadsheet_url'] ?? null) && $spreadsheetId === null) {
            return response()->json([
                'message' => 'Masukkan link Google Sheets yang valid.',
            ], 422);
        }

        if ($spreadsheetId === null && blank($validated['description'] ?? null) && blank($validated['admin_notes'] ?? null)) {
            return response()->json([
                'message' => 'Tambahkan deskripsi, catatan admin, atau link Google Sheets sebelum membuat draft panduan.',
            ], 422);
        }

        try {
            return response()->json([
                'usage_guide' => $details->generateUsageGuide(
                    $validated['title'],
                    $validated['category'],
                    $validated['description'] ?? '',
                    $validated['admin_notes'] ?? '',
                    $spreadsheetId,
                ),
            ]);
        } catch (GoogleSheetsDescriptionException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 503);
        }
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:10000'],
            'price' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'file' => ['nullable', 'file', 'mimes:xlsx,xls,csv', 'max:30720'],
            'spreadsheet_url' => ['nullable', 'url', 'max:2048'],
            'status' => ['nullable', Rule::in([Product::STATUS_DRAFT, Product::STATUS_PUBLISHED, Product::STATUS_ARCHIVED])],
            'usage_guide' => [
                Rule::requiredIf(fn () => ($request->input('status') ?? $product->status) === Product::STATUS_PUBLISHED),
                'nullable',
                'string',
                'min:30',
                'max:12000',
            ],
        ]);

        $googleSheetId = filled($validated['spreadsheet_url'] ?? null)
            ? $this->spreadsheetId($validated['spreadsheet_url'])
            : null;

        if ($googleSheetId !== null && $request->hasFile('file')) {
            throw ValidationException::withMessages([
                'spreadsheet_url' => 'Pilih link Google Sheets atau unggah file Excel, jangan keduanya.',
            ]);
        }

        $previousFilePath = null;
        if ($request->hasFile('file')) {
            $file = $validated['file'];
            $previousFilePath = $product->file_path;
            $newFilePath = $file->store('excel-templates', 'local');
            abort_unless($newFilePath, 500, 'File template gagal disimpan.');
            $product->file_path = $newFilePath;
            $product->original_filename = $file->getClientOriginalName();
            $product->google_sheet_id = null;
        } elseif ($googleSheetId !== null) {
            $previousFilePath = $product->file_path;
            $product->file_path = null;
            $product->original_filename = null;
            $product->google_sheet_id = $googleSheetId;
        }

        $product->title = $validated['title'];
        $product->category = $validated['category'];
        $product->description = $validated['description'];
        $product->price = $validated['price'];
        if (array_key_exists('usage_guide', $validated)) {
            $product->usage_guide = $validated['usage_guide'];
        }

        if (isset($validated['status'])) {
            $product->status = $validated['status'];
            if ($validated['status'] === Product::STATUS_PUBLISHED && ! $product->published_at) {
                $product->published_at = now();
            }
        }

        $product->save();

        if ($previousFilePath !== null && ! $product->orderItems()
            ->where(function ($query) use ($previousFilePath) {
                $query->where('file_path', $previousFilePath)->orWhereNull('file_path');
            })
            ->exists()) {
            Storage::disk('local')->delete($previousFilePath);
        }

        return back()->with('status', 'Informasi template berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([Product::STATUS_DRAFT, Product::STATUS_PUBLISHED, Product::STATUS_ARCHIVED])],
        ]);

        $status = $validated['status'];
        if ($status === Product::STATUS_PUBLISHED && ! filled($product->usage_guide)) {
            return back()->withErrors([
                'usage_guide' => 'Tambahkan panduan penggunaan minimal 30 karakter sebelum menerbitkan template.',
            ]);
        }
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
            return back()->withErrors(['product' => 'Template tidak dapat dihapus karena sudah tercatat dalam pesanan pembeli. Ubah status menjadi arsip (archived) sebagai gantinya.']);
        }

        if ($product->file_path) {
            Storage::disk('local')->delete($product->file_path);
        }
        $product->delete();

        return back()->with('status', 'Template dan file privatnya berhasil dihapus.');
    }

    private function spreadsheetId(string $url): string
    {
        $spreadsheetId = GoogleSheetsLink::spreadsheetId($url);

        if ($spreadsheetId === null) {
            throw ValidationException::withMessages([
                'spreadsheet_url' => 'Masukkan link Google Sheets yang valid, bukan link file atau folder Google Drive.',
            ]);
        }

        return $spreadsheetId;
    }
}
