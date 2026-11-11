<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when($request->string('q')->toString(), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->when($request->string('role')->toString(), fn ($query, $role) => $query->where('role', $role))
            ->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => $request->only('q', 'role'),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->is($user), 422, 'Admin tidak dapat mengubah role akunnya sendiri.');

        $validated = $request->validate([
            'role' => ['required', Rule::in([User::ROLE_BUYER, User::ROLE_SELLER, User::ROLE_ADMIN])],
        ]);

        $user->forceFill(['role' => $validated['role']])->save();

        return back()->with('status', 'Role pengguna diperbarui.');
    }
}
