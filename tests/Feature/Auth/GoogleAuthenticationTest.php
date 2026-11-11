<?php

use App\Models\User;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;

test('google login reports when oauth credentials are missing', function () {
    config([
        'services.google.client_id' => null,
        'services.google.client_secret' => null,
        'services.google.redirect' => null,
    ]);

    $this->get(route('google.redirect'))
        ->assertRedirect(route('login'))
        ->assertSessionHas('google_error');
});

test('verified google users can register and authenticate as buyers', function () {
    config([
        'services.google.client_id' => 'client-id',
        'services.google.client_secret' => 'client-secret',
        'services.google.redirect' => 'http://localhost/auth/google/callback',
    ]);

    $googleUser = (new GoogleUser)
        ->setRaw(['sub' => 'google-user-123', 'email' => 'google@example.com', 'email_verified' => true])
        ->map(['id' => 'google-user-123', 'name' => 'Google User', 'email' => 'google@example.com']);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($googleUser);
    Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

    $this->get(route('google.callback'))
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'name' => 'Google User',
        'email' => 'google@example.com',
        'google_id' => 'google-user-123',
        'role' => User::ROLE_BUYER,
    ]);
    expect(User::query()->where('email', 'google@example.com')->first()->email_verified_at)->not->toBeNull();
});

test('google login links a verified email to an existing account without changing its role', function () {
    config([
        'services.google.client_id' => 'client-id',
        'services.google.client_secret' => 'client-secret',
        'services.google.redirect' => 'http://localhost/auth/google/callback',
    ]);

    $user = User::factory()->create([
        'email' => 'existing@example.com',
        'email_verified_at' => null,
        'role' => User::ROLE_ADMIN,
    ]);
    $googleUser = (new GoogleUser)
        ->setRaw(['sub' => 'google-user-456', 'email' => 'existing@example.com', 'email_verified' => true])
        ->map(['id' => 'google-user-456', 'name' => 'Existing User', 'email' => 'existing@example.com']);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($googleUser);
    Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

    $this->get(route('google.callback'))
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'google_id' => 'google-user-456',
        'role' => User::ROLE_ADMIN,
    ]);
    expect($user->fresh()->email_verified_at)->not->toBeNull();
});

test('unverified google email cannot authenticate or create an account', function () {
    config([
        'services.google.client_id' => 'client-id',
        'services.google.client_secret' => 'client-secret',
        'services.google.redirect' => 'http://localhost/auth/google/callback',
    ]);

    $googleUser = (new GoogleUser)
        ->setRaw(['sub' => 'google-user-789', 'email' => 'unverified@example.com', 'email_verified' => false])
        ->map(['id' => 'google-user-789', 'name' => 'Unverified User', 'email' => 'unverified@example.com']);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($googleUser);
    Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

    $this->get(route('google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHas('google_error');

    $this->assertGuest();
    $this->assertDatabaseMissing('users', ['email' => 'unverified@example.com']);
});
