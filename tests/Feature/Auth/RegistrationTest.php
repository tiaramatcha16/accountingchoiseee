<?php

use Illuminate\Support\Facades\Hash;

test('registration screen can be rendered', function () {
    $this->get('/register')->assertStatus(200);
});

test('new users are persisted as buyers and signed in', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'TEST@example.com',
        'phone' => '081234567890',
        'institution' => 'AccountingChoice',
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
        'institution' => 'AccountingChoice',
        'city' => 'Jakarta',
        'role' => 'buyer',
    ]);

    $user = \App\Models\User::query()->where('email', 'test@example.com')->firstOrFail();
    expect(Hash::check('password', $user->password))->toBeTrue();
    $response->assertRedirect(route('dashboard', absolute: false));
});
