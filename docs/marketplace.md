# Excel template marketplace MVP

## Setup

After pulling branch `dev`, run `php artisan migrate`, then run the normal Laravel/Vite development commands. Grant an existing account admin access with `php artisan users:make-admin email@example.com`. Public registration and Google sign-in always create buyer accounts.

## Dashboards and workflows

- Buyers land on `/dashboard` for order/payment stats, recent purchases, featured templates, and links to catalog, orders, and seller application.
- Admins opening `/dashboard` are routed to `/admin`, with catalog moderation, order review, user roles, seller approvals, sales metrics, and navigation.
- Approved sellers opening `/dashboard` are routed to `/seller/products` to manage private uploads submitted as drafts.

## Buyer workflow

Buyers browse `/templates`, create an order, and track it at `/my-orders`. Files stay on the private Laravel `local` disk and are served only after authentication, checking that the order belongs to the buyer, the item belongs to the order, and the order is marked paid.

## Seller workflow

A buyer submits an application at `/become-a-seller`. Admins review applications at `/admin/seller-applications`; approval grants seller role. Sellers upload `.xlsx`/`.xls` files from `/seller/products`. Uploads are stored privately and created as drafts; only admin moderation can publish them.

## Payment limitation

This version creates pending orders but does not collect money. Admin payment verification is intentionally manual. Do not mark an order paid unless payment has actually been confirmed. Payment-provider checkout/webhooks, refunds, seller payouts, and automated email receipts require payment account credentials and deployment configuration.
