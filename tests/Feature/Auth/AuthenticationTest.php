<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $this->get('/login')->assertStatus(200);
});

test('users can authenticate using the login screen and email casing is normalized', function () {
    $user = User::factory()->create(['email' => 'test@example.com']);

    $response = $this->post('/login', [
        'email' => '  TEST@EXAMPLE.COM  ',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('home', absolute: false));
});

test('buyers return to their intended checkout after login', function () {
    $user = User::factory()->create();

    $this->withSession(['url.intended' => '/checkout'])
        ->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
        ->assertRedirect('/checkout');
});

test('admins can log in through the admin login and reach the admin dashboard', function () {
    $admin = User::factory()->admin()->create(['email' => 'admin@example.com']);

    $response = $this->post('/admin/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($admin);
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
