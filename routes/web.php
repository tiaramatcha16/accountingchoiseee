<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Marketplace\BuyerOrderController;
use App\Http\Controllers\Marketplace\CatalogController;
use App\Http\Controllers\Marketplace\OrderController as MarketplaceOrderController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('landing-page/index');
})->name('home');

Route::get('/templates', [CatalogController::class, 'index'])->name('catalog.index');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('/templates/{product}/orders', [MarketplaceOrderController::class, 'store'])
        ->name('orders.store');
    Route::get('/my-orders', [BuyerOrderController::class, 'index'])->name('orders.index');
    Route::get('/my-orders/{order}/items/{item}/download', [BuyerOrderController::class, 'download'])
        ->name('orders.download');

    Route::prefix('admin')->name('admin.')->middleware(EnsureUserIsAdmin::class)->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::patch('/products/{product}/status', [AdminProductController::class, 'updateStatus'])->name('products.status');
        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('account-dashboard', fn () => Inertia::render('dashboard'))->name('account.dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
