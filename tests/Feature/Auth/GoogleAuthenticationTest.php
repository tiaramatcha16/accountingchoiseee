<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('google oauth endpoints are not registered', function () {
    $this->get('/auth/google/redirect')->assertNotFound();
    $this->get('/auth/google/callback')->assertNotFound();
});

test('public registration creates a buyer account without external authentication', function () {
    $this->post('/register', [
        'name' => 'Buyer Test',
        'email' => 'buyer@example.com',
        'phone' => '08123456789',
        'institution' => 'Personal',
        'city' => 'Jakarta',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertDatabaseHas('users', ['email' => 'buyer@example.com', 'role' => User::ROLE_BUYER]);
    $this->assertAuthenticated();
});
