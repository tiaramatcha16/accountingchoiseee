<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\SellerApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SellerApplicationController extends Controller
{
    public function show(Request $request): InertiaResponse
    {
        abort_if($request->user()->isSeller() || $request->user()->isAdmin(), 403);

        return Inertia::render('marketplace/seller-application', [
            'application' => SellerApplication::query()->where('user_id', $request->user()->id)->first(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_if($request->user()->isSeller() || $request->user()->isAdmin(), 403);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:30', 'max:3000'],
        ]);

        $application = SellerApplication::query()->firstOrNew(['user_id' => $request->user()->id]);
        if ($application->exists && $application->status === SellerApplication::STATUS_PENDING) {
            return back()->withErrors(['reason' => 'Pengajuan kamu sedang menunggu pemeriksaan admin.']);
        }

        $application->fill([
            'reason' => $validated['reason'],
            'status' => SellerApplication::STATUS_PENDING,
            'admin_note' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ])->save();

        return back()->with('status', 'Pengajuan penjual berhasil dikirim dan menunggu pemeriksaan admin.');
    }
}
