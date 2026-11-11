<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

        if (request()->query('error') === 'access_denied') {
            return to_route('login')->with('google_error', 'Login Google dibatalkan. Silakan coba lagi.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (InvalidStateException|GuzzleException $exception) {
            Log::warning('Google OAuth callback failed.', ['exception' => $exception::class]);

            return to_route('login')->with('google_error', 'Login Google gagal atau kedaluwarsa. Silakan coba lagi.');
        }

        $email = $googleUser->getEmail();
        $googleId = $googleUser->getId();
        $rawGoogleUser = $googleUser->getRaw();
        $isVerified = filter_var(
            $rawGoogleUser['email_verified'] ?? $rawGoogleUser['verified_email'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        if (! $email || ! filter_var($email, FILTER_VALIDATE_EMAIL) || ! $googleId || ! $isVerified) {
            return to_route('login')->with('google_error', 'Google tidak memberikan email terverifikasi. Gunakan akun Google lain atau daftar dengan email.');
        }

        $user = User::query()->where('google_id', $googleId)->first();

        if ($user && $user->email !== $email && User::query()->where('email', $email)->whereKeyNot($user->getKey())->exists()) {
            return to_route('login')->with('google_error', 'Email Google ini sudah terhubung ke akun lain. Hubungi tim dukungan.');
        }

        if (! $user) {
            $user = User::query()->where('email', $email)->first();
        }

        if ($user) {
            if ($user->google_id && $user->google_id !== $googleId) {
                return to_route('login')->with('google_error', 'Akun ini sudah terhubung ke akun Google lain. Hubungi tim dukungan.');
            }

            $user->forceFill([
                'email' => $email,
                'email_verified_at' => $user->email_verified_at ?? now(),
                'google_id' => $googleId,
            ])->save();
        } else {
            $user = User::query()->forceCreate([
                'name' => $googleUser->getName() ?: Str::before($email, '@'),
                'email' => $email,
                'email_verified_at' => now(),
                'google_id' => $googleId,
                'password' => Hash::make(Str::random(40)),
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
