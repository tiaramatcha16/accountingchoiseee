<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('buyer login page renders buyer mode and buyer can sign in', function () {
    $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

    $this->get('/login')->assertOk()->assertInertia(fn ($page) => $page->component('auth/login')->where('adminMode', false));
    $this->post('/login', ['email' => $buyer->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($buyer);
});

test('admin login page is separate and admin can sign in only there', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->get('/admin/login')->assertOk()->assertInertia(fn ($page) => $page->component('auth/login')->where('adminMode', true));
    $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect('/login')->assertSessionHas('role_error');
    $this->assertGuest();

    $this->post('/admin/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect(route('admin.dashboard', absolute: false));
    $this->assertAuthenticatedAs($admin);
});

test('buyer credentials cannot enter admin login', function () {
    $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

    $this->post('/admin/login', ['email' => $buyer->email, 'password' => 'password'])
        ->assertRedirect('/admin/login')->assertSessionHas('role_error');

    $this->assertGuest();
});
