<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'users:make-admin {email : Email address of an existing user}';

    protected $description = 'Manually grant admin access to an existing user';

    public function handle(): int
    {
        $user = User::query()->where('email', mb_strtolower(trim($this->argument('email'))))->first();

        if (! $user) {
            $this->error('No user found with that email address.');

            return self::FAILURE;
        }

        if ($user->isAdmin()) {
            $this->info('This user is already an admin.');

            return self::SUCCESS;
        }

        $user->forceFill(['role' => User::ROLE_ADMIN])->save();
        $this->info("Admin access granted to {$user->email}.");

        return self::SUCCESS;
    }
}
