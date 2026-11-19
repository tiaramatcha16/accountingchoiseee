<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $product = Product::where('id', $validated['product_id'])
            ->where('status', Product::STATUS_PUBLISHED)
            ->firstOrFail();

        $addQuantity = (int) ($validated['quantity'] ?? 1);

        $cartItem = CartItem::firstOrNew([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        $cartItem->quantity = ($cartItem->exists ? (int) $cartItem->quantity : 0) + $addQuantity;
        $cartItem->save();

        return back()->with('status', 'Template "' . $product->title . '" berhasil ditambahkan ke keranjang!');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        $cartItem = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->firstOrFail();

        $cartItem->update(['quantity' => $validated['quantity']]);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return back()->with('status', 'Template dihapus dari keranjang.');
    }

    public function clear(Request $request): RedirectResponse
    {
        CartItem::where('user_id', $request->user()->id)->delete();

        return back()->with('status', 'Keranjang berhasil dikosongkan.');
    }
}

