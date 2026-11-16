<?php

namespace App\Http\Controllers\Marketplace;

use App\Exceptions\ProductUsageGuideException;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\ProductUsageGuideAssistant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class ProductUsageGuideController extends Controller
{
    public function __invoke(
        Request $request,
        Order $order,
        OrderItem $item,
        ProductUsageGuideAssistant $assistant,
    ): JsonResponse {
        abort_unless($order->buyer_id === $request->user()->id, 404);
        abort_unless($order->status === Order::STATUS_PAID, 403, 'Pesanan belum dibayar.');
        abort_unless($item->order_id === $order->id, 404);

        $product = $item->product;
        abort_unless($product, 404);

        $validated = $request->validate([
            'consent' => ['required', 'accepted'],
            'question' => ['required', 'string', 'min:3', 'max:1000'],
            'history' => ['nullable', 'array', 'max:8'],
            'history.*.role' => ['required', Rule::in(['user', 'assistant'])],
            'history.*.content' => ['required', 'string', 'max:1000'],
        ]);

        if (! filled($product->usage_guide)) {
            return response()->json([
                'answer' => 'Panduan penggunaan untuk template ini sedang disiapkan admin. Untuk sementara, silakan tanyakan langsung kepada admin.',
                'source' => null,
                'supported' => false,
            ]);
        }

        try {
            return response()->json($assistant->answer(
                $product,
                trim($validated['question']),
                $validated['history'] ?? [],
            ));
        } catch (ProductUsageGuideException $exception) {
            Log::warning('AI product usage guidance was unavailable.', [
                'product_id' => $product->id,
                'reason' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Panduan AI belum tersedia saat ini. Silakan coba kembali atau hubungi admin.',
            ], 503);
        }
    }
}
