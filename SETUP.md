# Stripe + Convex setup

## 1. Install the Stripe SDK
```
npm install stripe
```

## 2. Create products/prices in Stripe
In the Stripe Dashboard → Products, create a recurring "Pro Coach" price
($10/month). Copy its **Price ID** (starts with `price_`).

## 3. Environment variables
Set these in the **Convex dashboard** (Settings → Environment Variables),
not just your local `.env` — actions/http routes run on Convex's servers:

| Variable               | Where to get it                                      |
|-------------------------|-------------------------------------------------------|
| `STRIPE_SECRET_KEY`     | Stripe Dashboard → Developers → API keys (secret key) |
| `STRIPE_PRICE_PRO`      | The Price ID from step 2                              |
| `STRIPE_WEBHOOK_SECRET` | From step 4 below                                     |
| `SITE_URL`              | Your app's URL, e.g. `https://yourapp.com`            |

## 4. Webhook
In Stripe Dashboard → Developers → Webhooks, add an endpoint pointing to:
```
https://<your-convex-deployment>.convex.site/stripe/webhook
```
(Your Convex HTTP Actions URL — find it under Settings → URL and Deploy Key,
it's the `.convex.site` domain, not `.convex.cloud`.)

Subscribe to these events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the **Signing secret** shown after creating the endpoint into
`STRIPE_WEBHOOK_SECRET`.

## 5. Files in this delivery
- `convex/schema.ts` — table shapes to merge into your existing schema
- `convex/stripeHelpers.ts` — internal queries/mutations the webhook uses
- `convex/stripe.ts` — public actions: `createCheckoutSession`, `createPortalSession`
- `convex/http.ts` — the `/stripe/webhook` route
- `PricingPage.jsx` — updated CTA buttons that call `createCheckoutSession`
  for the Pro plan and `createPortalSession` for existing subscribers

## 6. Local testing
Use the Stripe CLI to forward events to your dev deployment:
```
stripe listen --forward-to https://<your-dev-deployment>.convex.site/stripe/webhook
```
Use Stripe's test card `4242 4242 4242 4242` with any future expiry/CVC.

## Notes on what I assumed
- Your `users` table doesn't yet have `plan`/`stripeCustomerId` fields —
  the schema file adds them without touching anything else.
- The "Free Trial" button currently just redirects to `/signup` (no
  payment needed) — update that path if yours differs.
- The Business tier stays disabled until you're ready to launch it; wiring
  it up later is just adding its price ID to `PRICE_IDS` in `stripe.ts`.
