# Excel template marketplace MVP

## Setup

After pulling branch `dev`, run `php artisan migrate` and start the Laravel/Vite development servers. Public registration creates buyer accounts only. The buyer login is `/login`; the owner/admin login is `/admin/login`.

Promote the owner's already-registered account to admin from the project terminal:

```sh
php artisan users:make-admin owner@example.com
```

No Google sign-in is enabled. Buyers and admins use email/password, and the admin account must be provisioned manually.

## Buyer workflow

Buyers browse `/templates`, create an order, and track it at `/my-orders`. Files remain on Laravel's private `local` disk and can only be downloaded after the buyer owns the order and an admin verifies payment.

## Owner/admin workflow

The owner logs in at `/admin/login`, then manages Excel products at `/admin/products`, order verification at `/admin/orders`, and user accounts at `/admin/users`. New uploads are drafts until reviewed and published.

## Payment limitation

Orders are created as pending. This branch does not collect money automatically; verify actual payment outside the app before marking an order paid. Payment provider integration and webhooks are not configured.
