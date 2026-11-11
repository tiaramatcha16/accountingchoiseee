# Authentication setup (branch `dev`)

The application stores password and Google accounts in Laravel's `users` table. Public registration and first-time Google sign-in create buyer accounts. The public forms do not accept a role; admin access must be granted by an operator.

## Database

1. Copy `.env.example` to `.env` and configure the database connection for your environment.
2. Generate the application key if this is a fresh checkout: `php artisan key:generate`.
3. Run migrations: `php artisan migrate`.

The role migration adds `users.role` with a `buyer` default. Existing users also receive the buyer role when the migration runs. Back up production data before running schema changes.

## Google OAuth

1. Create an OAuth 2.0 Client ID in Google Cloud Console, choosing **Web application**.
2. Add the exact callback URL for the environment to **Authorized redirect URIs**. For local development with the defaults, use `http://localhost/auth/google/callback`.
3. Set these values in the local `.env` (never commit real secrets):

```dotenv
APP_URL=http://localhost
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

4. Clear cached configuration after changing environment values: `php artisan config:clear`.
5. Start Laravel and Vite using the repository's normal development commands, then test both email/password and Google flows.

For deployed environments, use HTTPS and configure the redirect URI to exactly match the deployed domain. Keep the client secret only in the server environment, not in frontend variables.

## Manually granting admin access

Only an operator with command-line access should run:

```sh
php artisan users:make-admin user@example.com
```

This command only promotes an existing account and cannot be invoked through public registration or Google sign-in.

## Tests

Run the authentication feature tests with `php artisan test --testsuite=Feature` (or run the full suite with `php artisan test`). Google provider behavior is mocked in tests; a real OAuth client is only needed for a manual browser test.
