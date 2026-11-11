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
            'googleError' => $request->session()->get('google_error'),
            'roleError' => $request->session()->get('role_error'),
            'adminMode' => $request->routeIs('admin.login'),
        ]);
    }

    public function storeBuyer(LoginRequest $request): RedirectResponse
    {
        return $this->authenticateForRole($request, UserRole::BUYER);
    }

    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        return $this->authenticateForRole($request, UserRole::ADMIN);
    }

    private function authenticateForRole(LoginRequest $request, string $expectedRole): RedirectResponse
    {
        $request->authenticate();
        $user = $request->user();

        if (($user->role ?? UserRole::BUYER) !== $expectedRole) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $loginRoute = $expectedRole === UserRole::ADMIN ? 'admin.login' : 'login';
            $message = $expectedRole === UserRole::ADMIN
                ? 'Akun ini bukan akun admin. Gunakan login pembeli.'
                : 'Akun admin harus masuk melalui halaman login admin.';

            return to_route($loginRoute)->with('role_error', $message);
        }

        $request->session()->regenerate();

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

/** Internal role identifiers for the login controller. */
final class UserRole
{
    public const BUYER = 'buyer';

    public const ADMIN = 'admin';
}
