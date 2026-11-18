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
        'institution' => 'Personal',
        'city' => 'Jakarta',
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
        'institution' => 'Personal',
        'city' => 'Jakarta',
        'role' => 'buyer',
    ]);

    $user = \App\Models\User::query()->where('email', 'test@example.com')->firstOrFail();
    expect(Hash::check('password', $user->password))->toBeTrue();
    $response->assertRedirect(route('home', absolute: false));
});

test('registration requires phone, institution, and city', function () {
    $response = $this->post('/register', [
        'name' => 'No Phone User',
        'email' => 'nophone@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors(['phone', 'institution', 'city']);
    $this->assertDatabaseMissing('users', ['email' => 'nophone@example.com']);
});
