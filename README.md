# I4I Centre

Coming-soon website for I4I Centre, built with Next.js and TypeScript.

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:3000`.

## Mailing list

The signup uses a double-opt-in flow backed by Resend Contacts:

1. A visitor submits an email address.
2. The server emails a signed confirmation link that expires after 48 hours.
3. Confirmation creates or re-subscribes the Resend contact.
4. A confirmation receipt and the confirmation page provide an unsubscribe link.
5. Unsubscribe requires an explicit confirmation and updates the Resend contact.

Copy `.env.example` to `.env.local` and configure `RESEND_API_KEY`, `NEWSLETTER_TOKEN_SECRET`, and a verified `NEWSLETTER_FROM_EMAIL`. Without Resend credentials, local development exposes a preview confirmation link and uses an in-memory subscriber store so the complete flow remains testable.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```
