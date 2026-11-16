<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'roleError' => $request->session()->get('role_error'),
            'adminMode' => $request->routeIs('admin.login'),
        ]);
    }

    public function storeBuyer(LoginRequest $request): RedirectResponse
    {
        return $this->authenticateForRole($request, 'buyer');
    }

    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        return $this->authenticateForRole($request, 'admin');
    }

    private function authenticateForRole(LoginRequest $request, string $expectedRole): RedirectResponse
    {
        $request->authenticate();
        $user = $request->user();

        if (($user->role ?? 'buyer') !== $expectedRole) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $loginRoute = $expectedRole === 'admin' ? 'admin.login' : 'login';
            $message = $expectedRole === 'admin'
                ? 'Akun ini bukan akun admin. Gunakan login pembeli.'
                : 'Akun admin harus masuk melalui halaman login admin.';

            return to_route($loginRoute)->with('role_error', $message);
        }

        $request->session()->regenerate();

        if ($request->user()?->isAdmin()) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
