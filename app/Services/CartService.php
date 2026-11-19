<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function add(int $userId, Product $product, int $quantity): void
    {
        DB::transaction(function () use ($userId, $product, $quantity) {
            User::query()->lockForUpdate()->findOrFail($userId);

            $cartItem = CartItem::query()
                ->where('user_id', $userId)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            $currentQuantity = (int) ($cartItem?->quantity ?? 0);

            if ($currentQuantity + $quantity > CartItem::MAX_QUANTITY) {
                throw ValidationException::withMessages([
                    'quantity' => 'Maksimal '.CartItem::MAX_QUANTITY.' unit untuk satu template.',
                ]);
            }

            $cartItem ??= new CartItem([
                'user_id' => $userId,
                'product_id' => $product->id,
            ]);

            $cartItem->quantity = $currentQuantity + $quantity;
            $cartItem->save();
        });
    }
}
