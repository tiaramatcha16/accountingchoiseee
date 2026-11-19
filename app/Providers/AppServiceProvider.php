<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (
            $this->app->environment('production')
            && config('database.default') === 'sqlite'
            && ! config('database.allow_sqlite_in_production')
        ) {
            throw new RuntimeException(
                'SQLite is disabled in production by default. Configure a persistent database, or set DB_ALLOW_SQLITE_IN_PRODUCTION=true only when the SQLite file is on persistent storage.',
            );
        }
    }
}
