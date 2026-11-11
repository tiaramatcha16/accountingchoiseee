<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SellerApplicationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/seller-applications', [
            'applications' => SellerApplication::query()->with('user:id,name,email')->latest()->paginate(20),
        ]);
    }

    public function review(Request $request, SellerApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([SellerApplication::STATUS_APPROVED, SellerApplication::STATUS_REJECTED])],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($application->status !== SellerApplication::STATUS_PENDING) {
            return back()->withErrors(['application' => 'Pengajuan ini sudah pernah diputuskan.']);
        }

        $application->load('user');
        $application->forceFill([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ])->save();

        if ($validated['status'] === SellerApplication::STATUS_APPROVED) {
            $application->user->forceFill(['role' => User::ROLE_SELLER])->save();
        }

        return back()->with('status', 'Pengajuan penjual telah diperiksa.');
    }
}
