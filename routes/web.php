<?php

use App\Http\Controllers\Admin\ChatController as AdminChatController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SalesAnalyticsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Marketplace\BuyerOrderController;
use App\Http\Controllers\Marketplace\CartController;
use App\Http\Controllers\Marketplace\CatalogController;
use App\Http\Controllers\Marketplace\ChatController;
use App\Http\Controllers\Marketplace\MidtransNotificationController;
use App\Http\Controllers\Marketplace\OrderController as MarketplaceOrderController;
use App\Http\Controllers\Marketplace\ProductRecommendationController;
use App\Http\Controllers\Marketplace\ProductUsageGuideController;
use App\Http\Controllers\Seller\ProductController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsSeller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $products = Product::where('status', Product::STATUS_PUBLISHED)
        ->orderByDesc('published_at')
        ->orderByDesc('id')
        ->get(['id', 'title', 'slug', 'category', 'description', 'price']);

    return Inertia::render('landing-page/index', [
        'products' => $products,
    ]);
})->name('home');
Route::get('/templates', [CatalogController::class, 'index'])->name('catalog.index');
Route::post('/templates/recommendations', ProductRecommendationController::class)
    ->middleware('throttle:6,1')
    ->name('catalog.recommendations');
Route::get('/templates/{product:slug}', [CatalogController::class, 'show'])->name('catalog.show');
Route::post('/payments/midtrans/notification', MidtransNotificationController::class)->name('payments.midtrans.notification');

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AuthenticatedSessionController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AuthenticatedSessionController::class, 'storeAdmin'])->name('admin.login.store');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        if ($request->user()->isAdmin()) {
            return to_route('admin.dashboard');
        }

        return to_route('home');
    })->name('dashboard');

    Route::get('/checkout', [MarketplaceOrderController::class, 'showCheckout'])->name('checkout.show');
    Route::post('/checkout', [MarketplaceOrderController::class, 'checkout'])->name('checkout.store');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{product}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{product}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::post('/templates/{product}/orders', [MarketplaceOrderController::class, 'store'])->name('orders.store');
    Route::get('/my-orders', [BuyerOrderController::class, 'index'])->name('orders.index');
    Route::get('/my-orders/{order}/items/{item}/download', [BuyerOrderController::class, 'download'])->name('orders.download');
    Route::post('/my-orders/{order}/items/{item}/guide', ProductUsageGuideController::class)
        ->middleware('throttle:10,1')
        ->name('orders.guide.ask');
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/widget', [ChatController::class, 'widget'])->name('chat.widget');
    Route::get('/chat/unread', [ChatController::class, 'unread'])->name('chat.unread');
    Route::post('/chat/messages', [ChatController::class, 'store'])->middleware('throttle:20,1')->name('chat.messages.store');

    Route::prefix('seller')->name('seller.')->middleware(EnsureUserIsSeller::class)->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    });

    Route::prefix('admin')->name('admin.')->middleware(EnsureUserIsAdmin::class)->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::get('/analytics', [SalesAnalyticsController::class, 'index'])->name('analytics');
        Route::get('/analytics/export/pdf', [SalesAnalyticsController::class, 'exportPdf'])->name('analytics.export.pdf');
        Route::get('/analytics/export/excel', [SalesAnalyticsController::class, 'exportExcel'])->name('analytics.export.excel');
        Route::post('/analytics/recommendations', [SalesAnalyticsController::class, 'recommendations'])
            ->middleware('throttle:5,1')
            ->name('analytics.recommendations');
        Route::get('/chats', [AdminChatController::class, 'index'])->name('chats.index');
        Route::post('/chats/{conversation}/messages', [AdminChatController::class, 'reply'])
            ->middleware('throttle:30,1')
            ->name('chats.messages.store');
        Route::post('/chat-faqs', [AdminChatController::class, 'storeFaq'])->name('chat-faqs.store');
        Route::patch('/chat-faqs/{faq}', [AdminChatController::class, 'updateFaq'])->name('chat-faqs.update');
        Route::delete('/chat-faqs/{faq}', [AdminChatController::class, 'destroyFaq'])->name('chat-faqs.destroy');
        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::post('/products/generate-details', [AdminProductController::class, 'generateDetails'])
            ->middleware('throttle:10,1')
            ->name('products.generate-details');
        Route::post('/products/generate-usage-guide', [AdminProductController::class, 'generateUsageGuide'])
            ->middleware('throttle:10,1')
            ->name('products.generate-usage-guide');
        Route::patch('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
        Route::patch('/products/{product}/status', [AdminProductController::class, 'updateStatus'])->name('products.status');
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');
        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::post('/orders/{order}/mark-paid', [AdminOrderController::class, 'markPaid'])->name('orders.mark-paid');
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
