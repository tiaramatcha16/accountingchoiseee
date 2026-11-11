# Excel template marketplace MVP

Marketplace screens and data model are in the Laravel/Inertia application.

## Setup

After pulling branch `dev`, run `php artisan migrate`, then `npm install` if needed and run the normal Laravel/Vite dev commands. Admin access is only for manually provisioned users: `php artisan users:make-admin email@example.com` (the account must first exist). Do not expose an admin-registration form.

## Admin workflow

1. Open `/admin` as an admin account.
2. Add an Excel `.xlsx` or `.xls` file, title, category, description, and integer price in rupiah.
3. New files are stored on Laravel's private `local` disk and products begin as drafts.
4. Review the listing and publish it. Only published products appear in `/templates`.
5. Review buyer orders at `/admin/orders`. In this MVP, payment is not connected to a payment provider: verify an actual payment outside the app, then mark the pending order paid and optionally record its payment reference. Cancel pending orders where appropriate.

## Buyer workflow and file security

Buyers sign in, browse `/templates`, create an order, and track it at `/my-orders`. Files are served through an authenticated download controller only when the order belongs to the buyer and is marked paid. Files are not placed in the public web directory. Admins must not mark an order paid until payment is confirmed. Payment-provider webhooks, seller payouts, and seller self-service are not part of this first implementation.

Prices are stored as whole Indonesian rupiah values. Orders preserve title and price snapshots so later catalog changes do not rewrite the order record.
