<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated buyers are sent to the storefront instead of the dashboard layout', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')
        ->assertRedirect('/');

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('landing-page/index'));
});