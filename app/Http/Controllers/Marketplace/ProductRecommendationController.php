<?php

namespace App\Http\Controllers\Marketplace;

use App\Exceptions\ProductRecommendationException;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductRecommendationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProductRecommendationController extends Controller
{
    public function __invoke(Request $request, ProductRecommendationService $recommendations): JsonResponse
    {
        $validated = $request->validate([
            'needs' => ['required', 'string', 'min:8', 'max:1500'],
        ]);
        $products = Product::query()
            ->where('status', Product::STATUS_PUBLISHED)
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get(['id', 'title', 'slug', 'category', 'description', 'price']);

        if ($products->isEmpty()) {
            return response()->json(['recommendations' => []]);
        }

        try {
            return response()->json([
                'recommendations' => $recommendations->recommend(trim($validated['needs']), $products),
            ]);
        } catch (ProductRecommendationException $exception) {
            Log::warning('AI product recommendations were unavailable.', [
                'reason' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Pencarian AI belum tersedia saat ini. Kamu tetap bisa mencari template lewat katalog.',
            ], 503);
        }
    }
}
