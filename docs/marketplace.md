# Excel template marketplace MVP

## Setup

After pulling branch `dev`, run `php artisan migrate`, then run the normal Laravel/Vite development commands. Grant an existing account admin access with `php artisan users:make-admin email@example.com`. Public registration and Google sign-in always create buyer accounts.

## Admin workflow

- `/admin`: sales summary, revenue for paid orders, monthly chart, recent orders, and popular products.
- `/admin/products`: privately upload `.xlsx`/`.xls` files (20 MB max), review drafts, publish, archive, or delete unused drafts.
- `/admin/orders`: search/filter orders and manually verify pending payments. Mark an order paid only after confirming the payment outside the app.
- `/admin/users`: search/filter accounts and manually grant buyer, seller, or admin roles. Admins cannot change their own role from the panel.

## Buyer workflow and download protection

Buyers browse `/templates`, create an order, and track it at `/my-orders`. The order records a price/title snapshot. Files stay on the private Laravel `local` disk and are served only after authentication, checking that the order belongs to the buyer, the item belongs to that order, and the order is marked paid.

## Payments and production caveat

This version creates pending orders but does not collect money. Admin payment verification is intentionally manual. Do not mark an order paid unless payment has actually been confirmed. Payment-provider checkout, signed webhooks, refunds, seller onboarding/payouts, and automated email receipts require a separate integration and deployment configuration.
