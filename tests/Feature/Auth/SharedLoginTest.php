<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('buyers and admins share a single login page', function () {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/login'));

    $this->get('/admin/login')->assertRedirect('/login');
});

test('buyers can sign in through the shared login page', function () {
    $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

    $this->post('/login', ['email' => $buyer->email, 'password' => 'password'])
        ->assertRedirect(route('home', absolute: false));

    $this->assertAuthenticatedAs($buyer);
});

test('admins can sign in through the shared login page and always reach the admin dashboard', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->withSession(['url.intended' => '/'])
        ->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect(route('admin.dashboard', absolute: false));

    $this->assertAuthenticatedAs($admin);
});
