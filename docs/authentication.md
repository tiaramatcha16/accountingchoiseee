# Authentication setup (branch `dev`)

The application stores user credentials in Laravel's `users` table. Public registration creates buyer accounts (`buyer`). The public form only requires name, email, optional phone number, and password (institution and city/domisili inputs have been removed). Admin access is separated and provisioned by the store owner configuration in `.env` / database seeder.

## Default Roles & Access

* **Buyer (`buyer`)**: Default role for all public registrations. Redirected to the storefront (`/`) upon login.
* **Admin (`admin`)**: Has access to `/admin` routes. Redirected directly to `/admin` (`admin.dashboard`) upon login.
* **Seller (`seller`)**: Can manage and submit template products for review.

## Admin Configuration

The admin credentials are configured in `.env`:

```env
ADMIN_NAME="admin"
ADMIN_EMAIL="kutirtiara16@gmail.com"
ADMIN_PASSWORD="rahasia"
```

To create or update the admin account in your local database, run:

```sh
php artisan db:seed
```

This will automatically create/update your admin account with role `admin` and encrypted password.

## Manually granting admin access

An operator can also grant admin rights to any existing user email:

```sh
php artisan users:make-admin user@example.com
```

## Google login

Google login and registration use Laravel Socialite. In Google Cloud Console, create an OAuth client for a web application and register the exact callback URL:

```text
https://your-domain/auth/google/callback
```

For local development, use the same host and port as `APP_URL`, for example `http://127.0.0.1:8000/auth/google/callback`. Set the matching values in `.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

The callback requires a verified Google email. A new Google account is created as a buyer; an existing account with the same verified email can be linked without changing its role. Google Drive OAuth credentials (`GOOGLE_DRIVE_*`) are configured separately for spreadsheet copy and delivery.

## Tests

Run the test suite with:

```sh
php artisan test
```
