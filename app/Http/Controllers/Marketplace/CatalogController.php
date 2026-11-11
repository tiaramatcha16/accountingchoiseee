<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->where('status', Product::STATUS_PUBLISHED)
            ->when(request('q'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%')
                        ->orWhere('category', 'like', '%'.$search.'%');
                });
            })
            ->when(request('category'), fn ($query, $category) => $query->where('category', $category))
            ->latest('published_at')
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('marketplace/catalog', [
            'products' => $products,
            'filters' => request()->only('q', 'category'),
            'categories' => Product::query()->where('status', Product::STATUS_PUBLISHED)
                ->select('category')->distinct()->orderBy('category')->pluck('category'),
        ]);
    }
}
