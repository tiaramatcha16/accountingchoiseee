<?php

use Illuminate\Support\Facades\Hash;

test('registration screen can be rendered', function () {
    $this->get('/register')->assertStatus(200);
});

test('new users are persisted as buyers and redirected to the storefront', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'TEST@example.com',
        'phone' => '081234567890',
        'password' => 'password',
        'password_confirmation' => 'password',
        // Malicious or stale clients cannot grant admin permissions.
        'role' => 'admin',
    ]);

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '081234567890',
        'institution' => null,
        'city' => null,
        'role' => 'buyer',
    ]);

    $user = \App\Models\User::query()->where('email', 'test@example.com')->firstOrFail();
    expect(Hash::check('password', $user->password))->toBeTrue();
    $response->assertRedirect(route('home', absolute: false));
});

test('registration does not require institution or city', function () {
    $response = $this->post('/register', [
        'name' => 'Buyer Without Institution Or City',
        'email' => 'buyer-without-location@example.com',
        'phone' => '081234567890',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('users', [
        'email' => 'buyer-without-location@example.com',
        'institution' => null,
        'city' => null,
    ]);
});
