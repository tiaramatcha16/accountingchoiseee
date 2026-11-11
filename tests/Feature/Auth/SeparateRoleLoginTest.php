<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('buyer login rejects an admin and redirects to admin login', function () {
    $admin = User::factory()->create(['email' => 'owner@example.com', 'role' => User::ROLE_ADMIN]);

    $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect('/login')
        ->assertSessionHas('role_error');

    $this->assertGuest();
});

test('admin login rejects a buyer account', function () {
    $buyer = User::factory()->create(['email' => 'buyer@example.com', 'role' => User::ROLE_BUYER]);

    $this->post('/admin/login', ['email' => $buyer->email, 'password' => 'password'])
        ->assertRedirect('/admin/login')
        ->assertSessionHas('role_error');

    $this->assertGuest();
});

test('admin login accepts only an admin account', function () {
    $admin = User::factory()->create(['email' => 'owner@example.com', 'role' => User::ROLE_ADMIN]);

    $this->post('/admin/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect(route('admin.dashboard', absolute: false));

    $this->assertAuthenticatedAs($admin);
});

test('buyer login accepts a buyer account', function () {
    $buyer = User::factory()->create(['email' => 'buyer@example.com', 'role' => User::ROLE_BUYER]);

    $this->post('/login', ['email' => $buyer->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($buyer);
});
