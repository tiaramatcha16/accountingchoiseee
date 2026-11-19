<?php

namespace App\Http\Middleware;

use App\Models\ChatConversation;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'adminChatNeedsReplyCount' => fn () => $request->user()?->isAdmin()
                ? ChatConversation::query()->where('status', ChatConversation::STATUS_NEEDS_ADMIN)->count()
                : 0,
            'cart' => function () use ($request): ?array {
                if (! $request->user()) {
                    return null;
                }

                $cartItems = $request->user()->cartItems()
                    ->with('product:id,title,category,price,slug')
                    ->get()
                    ->filter(fn ($item) => $item->product !== null);

                return [
                    'count' => (int) $cartItems->sum('quantity'),
                    'items' => $cartItems
                        ->map(fn ($item) => [
                            'id' => $item->product->id,
                            'title' => $item->product->title,
                            'category' => $item->product->category,
                            'price' => $item->product->price,
                            'slug' => $item->product->slug,
                            'quantity' => (int) ($item->quantity ?? 1),
                        ])
                        ->values()
                        ->all(),
                ];
            },
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
