# Excel template marketplace MVP

## Setup

After pulling branch `dev`, run `php artisan migrate` and start the Laravel/Vite development servers. Public registration creates buyer accounts only. Buyers and admins use the shared `/login` page; successful admin login redirects to `/admin`. The legacy `/admin/login` URL redirects to `/login`.

## Database persistence

The default SQLite connection is for local development. In production, configure a persistent MySQL or PostgreSQL database. The application refuses to start with SQLite in production unless `DB_ALLOW_SQLITE_IN_PRODUCTION=true` is explicitly set. Only enable that option when the SQLite file is stored on a persistent mounted volume; otherwise accounts and orders may disappear after a deployment or restart.

Promote the owner's already-registered account to admin from the project terminal:

```sh
php artisan users:make-admin owner@example.com
```

No Google sign-in is enabled. Buyers and admins use email/password, and the admin account must be provisioned manually.

- Buyers land on the storefront (`/`) after login or registration. The storefront keeps the cart, checkout, and order history available; `/dashboard` redirects buyers back to the storefront.
- Admins opening `/dashboard` are routed to `/admin`, with catalog moderation, order review, user roles, sales metrics, and navigation.
- Sellers assigned by an admin can manage private uploads from `/seller/products`; new uploads remain drafts until reviewed.

## Admin sales analytics

Admins can open `/admin/analytics` to compare daily, monthly, and yearly sales. Revenue and order counts include only paid orders and use `paid_at`; per-template revenue is the sum of each paid order item's recorded `unit_price`. Since order items do not store a quantity, each item counts as one unit sold. Preset comparisons shift the selected period back by one corresponding week, month, or year; custom ranges compare against an equal-length period immediately before the selected dates.

The chart and template table have independent date filters, presets, and custom start/end dates. The download panel also lets admins set separate custom date ranges directly for the PDF or `.xlsx` export, without changing the on-screen filters. Reports include styled summaries, comparison periods, trends, and per-template performance. Enable PHP's `zip` extension for PhpSpreadsheet when installing/running the application.

The optional Gemini recommendation analyzes aggregate store sales and published catalog items only. It receives no buyer names, email addresses, or other personal data and has no external trend source, so its suggestions describe internal store performance rather than internet-wide hype.

## Buyer workflow

Buyers browse `/templates`, create an order, and track it at `/my-orders`. Files remain on Laravel's private `local` disk and can only be downloaded after the buyer owns the order and an admin verifies payment.

## Owner/admin workflow

The owner logs in at `/login` and is redirected to `/admin`, then manages Excel products at `/admin/products`, order verification at `/admin/orders`, and user accounts at `/admin/users`. New uploads are drafts until reviewed and published.
An admin can assign the seller role from `/admin/users`. Seller uploads are stored privately and only admin moderation can publish them.

## Payment limitation

Checkout uses Midtrans when configured; offline checkout creates unpaid test orders only. Google Sheets delivery runs after a verified payment notification. See [Google Sheets delivery](google-sheets-delivery.md) for setup details.
