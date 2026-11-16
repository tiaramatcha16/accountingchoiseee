<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->hasGoogleCredentials()) {
            return to_route('login')->with('google_error', 'Login Google belum dikonfigurasi. Tambahkan kredensial Google OAuth ke file .env.');
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (! $this->hasGoogleCredentials()) {
            return to_route('login')->with('google_error', 'Login Google belum dikonfigurasi. Tambahkan kredensial Google OAuth ke file .env.');
        }

        if (request()->filled('error')) {
            $message = request()->query('error') === 'access_denied'
                ? 'Login Google dibatalkan. Silakan coba lagi.'
                : 'Google tidak dapat menyelesaikan login. Silakan coba lagi.';

            return to_route('login')->with('google_error', $message);
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (GuzzleException|InvalidStateException $exception) {
            Log::warning('Google OAuth callback failed.', ['exception' => $exception::class]);
            return to_route('login')->with('google_error', 'Login Google gagal atau kedaluwarsa. Silakan coba lagi.');
        }

        $email = Str::lower(trim((string) $googleUser->getEmail()));
        $googleId = $googleUser->getId();
        $rawGoogleUser = $googleUser->getRaw();
        $isVerified = filter_var($rawGoogleUser['email_verified'] ?? $rawGoogleUser['verified_email'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (! $email || ! filter_var($email, FILTER_VALIDATE_EMAIL) || ! $googleId || ! $isVerified) {
            return to_route('login')->with('google_error', 'Google tidak memberikan email terverifikasi.');
        }

        $user = User::query()->where('google_id', $googleId)->first() ?? User::query()->where('email', $email)->first();

        // Google sign-in is a buyer-only entry point. Admins must use /admin/login.
        if ($user?->isAdmin()) {
            return to_route('login')->with('google_error', 'Akun admin tidak dapat masuk melalui Google pembeli. Gunakan halaman login admin.');
        }

        if ($user && $user->google_id && $user->google_id !== $googleId) {
            return to_route('login')->with('google_error', 'Akun ini sudah terhubung ke akun Google lain.');
        }

        if ($user) {
            $user->forceFill(['email_verified_at' => $user->email_verified_at ?? now(), 'google_id' => $googleId])->save();
        } else {
            $user = User::query()->forceCreate([
                'name' => $googleUser->getName() ?: Str::before($email, '@'),
                'email' => $email,
                'email_verified_at' => now(),
                'google_id' => $googleId,
                'password' => Str::random(64),
                'role' => User::ROLE_BUYER,
            ]);
        }

        Auth::login($user);
        request()->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function hasGoogleCredentials(): bool
    {
        return (bool) config('services.google.client_id')
            && (bool) config('services.google.client_secret')
            && (bool) config('services.google.redirect');
    }
}
