<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SellerApplicationController as AdminSellerApplicationController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Marketplace\BuyerOrderController;
use App\Http\Controllers\Marketplace\CatalogController;
use App\Http\Controllers\Marketplace\OrderController as MarketplaceOrderController;
use App\Http\Controllers\Marketplace\SellerApplicationController;
use App\Http\Controllers\Seller\ProductController as SellerProductController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsSeller;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('landing-page/index'))->name('home');
Route::get('/templates', [CatalogController::class, 'index'])->name('catalog.index');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');
    Route::post('/templates/{product}/orders', [MarketplaceOrderController::class, 'store'])->name('orders.store');
    Route::get('/my-orders', [BuyerOrderController::class, 'index'])->name('orders.index');
    Route::get('/my-orders/{order}/items/{item}/download', [BuyerOrderController::class, 'download'])->name('orders.download');
    Route::get('/become-a-seller', [SellerApplicationController::class, 'show'])->name('seller.application');
    Route::post('/become-a-seller', [SellerApplicationController::class, 'store'])->name('seller.application.store');

    Route::prefix('seller')->name('seller.')->middleware(EnsureUserIsSeller::class)->group(function () {
        Route::get('/products', [SellerProductController::class, 'index'])->name('products.index');
        Route::post('/products', [SellerProductController::class, 'store'])->name('products.store');
    });

    Route::prefix('admin')->name('admin.')->middleware(EnsureUserIsAdmin::class)->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::patch('/products/{product}/status', [AdminProductController::class, 'updateStatus'])->name('products.status');
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');
        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');
        Route::get('/seller-applications', [AdminSellerApplicationController::class, 'index'])->name('seller-applications.index');
        Route::patch('/seller-applications/{application}', [AdminSellerApplicationController::class, 'review'])->name('seller-applications.review');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
