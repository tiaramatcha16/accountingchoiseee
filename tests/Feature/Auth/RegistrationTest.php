<?php

 test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '081234567890',
        'institution' => 'AccountingChoice',
        'city' => 'Jakarta',
        'password' => 'password',
        'password_confirmation' => 'password',
        // Public registration must not allow users to grant themselves privileges.
        'role' => 'admin',
    ]);

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'phone' => '081234567890',
        'institution' => 'AccountingChoice',
        'city' => 'Jakarta',
        'role' => 'buyer',
    ]);
    $response->assertRedirect(route('dashboard', absolute: false));
});
