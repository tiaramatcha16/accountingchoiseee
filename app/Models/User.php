<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_BUYER = 'buyer';
    public const ROLE_ADMIN = 'admin';

    /** Keep role outside fillable so public forms can never grant privileges. */
    protected $fillable = [
        'name', 'email', 'phone', 'institution', 'city', 'google_id', 'password',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed'];
    }

    public function isAdmin(): bool
    {
        return ($this->role ?? self::ROLE_BUYER) === self::ROLE_ADMIN;
    }
}
