# 8bitbrains agency portal

The public marketing page is rendered with reusable React components in the Next.js App Router. Its existing visual design and public assets are retained. The authenticated client and agency workspaces live on separate routes.

## Stack

- Next.js 16 App Router and React
- Custom credentials authentication (bcrypt hashed passwords & signed HTTP-only session cookies)
- Supabase Postgres for database
- ImageKit for project file uploads, deliverables, private storage & CDN delivery
- Zod validation and server-side route handlers
- Server-generated PDF invoices

## Local setup

1. Install dependencies with `npm install` (or `bun install`).
2. Create a Supabase project and an ImageKit account, then copy `.env.example` to `.env.local`.
3. Set the Supabase project URL and publishable key. Set `SUPABASE_SECRET_KEY` and `AUTH_SECRET` as server-only secrets.
4. Set `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, and `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`.
5. Apply the migrations with the Supabase CLI from this repository: `supabase db push`. Review the SQL before applying it to an existing database.
6. Run `npm run dev`.

Project files are securely uploaded directly to ImageKit using short-lived signed authentication parameters. Downloads use short-lived signed URLs with role and client access enforcement.

## Portal routes

- `/login`, `/signup`, `/forgot-password`, `/reset-password`
- `/dashboard`: client overview
- `/dashboard/requests`: submit and track project requests
- `/dashboard/proposals`: review and accept proposals
- `/dashboard/projects` and `/dashboard/projects/[projectId]`: project progress, milestones, client-visible updates, files, comments, approvals, and payment history
- `/dashboard/payments`, `/dashboard/invoices`, `/dashboard/notifications`, `/dashboard/profile`
- `/admin`, `/admin/requests`, `/admin/proposals/new?requestId=...`, `/admin/projects`, `/admin/projects/[projectId]`, `/admin/payments`, `/admin/invoices`, `/admin/notifications`
- `/team`: assigned projects for team members

The marketing navigation remains focused on the public site. Share portal URLs directly until marketing navigation is deliberately updated.

## Marketing page components

The homepage is assembled from small components under `app/_marketing/components/`:

- `MarketingNavigation.jsx` and `AccountMenu.jsx`: mobile header, desktop sidebar, sign-in/sign-up links, and role-aware portal/sign-out actions in the existing account menu.
- `HeroSection.jsx`: hero content and showreel controls.
- `StoryOpening.jsx`, `ProblemSection.jsx`, `SolutionSection.jsx`, and `AboutSection.jsx`: agency story sections.
- `PricingSection.jsx`: service tabs, price calculations, and retainer task controls.
- `FounderSection.jsx` and `SiteFooter`: founder and social footer content.

`app/_marketing/MarketingHome.jsx` composes the page. Its original stylesheet is isolated in `app/_marketing/marketing.css`; image assets remain in `public/` and are referenced with root-relative paths.

## First administrator

Public signups always create a `CLIENT` profile. To promote a user to administrator, run this once in the Supabase SQL Editor as a trusted project owner. Replace the email with the administrator's account email:

```sql
update public.profiles
set role = 'ADMIN', updated_at = now()
where lower(email) = lower('admin@example.com');
```

Confirm one profile row was updated. Never expose this operation in the public app or allow a user to submit a role value. Team accounts can be assigned by a trusted owner using the same procedure with `TEAM_MEMBER`; then an administrator can assign that team member to projects.

## Database security and RLS

This development migration intentionally does **not** enable RLS and does **not** create policies on application tables. It revokes table privileges from the Supabase `anon` and `authenticated` roles and grants table access to `service_role` only. All application table reads and writes use server-side handlers that verify the Supabase user with `auth.getUser()`, read the user's profile role, and enforce client ownership or administrator access before using the service key. The key is server-only.

This reduces direct Data API access while RLS is disabled. It does not make the system production-secure: a server authorization bug could still expose data, service credentials have broad database access, and RLS is an important defense in depth boundary. The app must not be described as production-ready until a security review and RLS rollout are complete.

Before production:

1. Design policies per table for clients, team members, admins, and service operations. Cover select, insert, update, delete, and storage objects.
2. Enable RLS table-by-table in a reviewed migration and set explicit grants; do not assume policies remove existing grants.
3. Add SQL tests for allow and deny cases for anonymous users, clients, team members, admins, and the server role.
4. Run tests against two clients and multiple projects to verify project isolation, proposal acceptance, payment allocation, invoice allocation, and internal-note visibility.
5. Verify Storage is private and signed upload/download URLs are short-lived. Add malware scanning and an operational cleanup for expired upload intents.
6. Deploy only after policy tests and an independent security review pass.

No remote database migration has been applied from this workspace.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`: public Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public Supabase publishable key.
- `SUPABASE_SECRET_KEY`: server-only Supabase secret key (or legacy `SUPABASE_SERVICE_ROLE_KEY`).
- `AUTH_SECRET`: secret used to sign custom session cookies (falls back to `SUPABASE_SECRET_KEY`).
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`: ImageKit public API key.
- `IMAGEKIT_PRIVATE_KEY`: ImageKit server-only private API key.
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`: ImageKit URL endpoint (e.g. `https://ik.imagekit.io/your_id`).

Keep real values in local or hosting secrets, never in client code or source control. Supabase Auth email verification and password reset email delivery depend on the Supabase project's email configuration.

## Manual payments and financial records

There is no payment gateway and no simulated online payment. Clients can report a bank/UPI/cash payment for manual review. Only administrators can verify or reject it. Verification runs in a Postgres transaction, prevents total verified payments from exceeding the agreed project price, allocates funds to milestones, and applies funds to issued invoices.

All money values are stored as integer paise. Project milestone totals must match the project total. Invoices are issued for unbilled milestone balances and can be downloaded as PDFs. Tax is currently stored as zero; GST rules, tax identifiers, invoice branding, and invoice numbering requirements still need agency configuration.

## Tests and checks

- `npm test`: unit tests for financial calculations and input validation.
- `npm run build`: Next.js production build.

The repository does not currently have a TypeScript configuration or lint script. Those checks are not reported as passing. Integration tests requiring a configured Supabase project and credentials still need to be run.

## Current limitations

- Supabase credentials are not present in this workspace, so auth, database migrations, Storage, and end-to-end flows have not been exercised against a remote Supabase project.
- The first administrator and team roles must be assigned through a trusted SQL procedure.
- Marketing contact buttons continue to use their original email links. The separate `/contact` route uses the validated `POST /api/contact` handler.
- Contact spam protection includes validation, a honeypot field, and a short per-email throttle. A production deployment should add a durable IP-aware rate limiter or CAPTCHA.
- File uploads restrict extensions/MIME declarations and size but do not scan file contents for malware. Expired upload intent cleanup is not automated.
- Invoice tax is zero and no accounting or GST configuration is present.
- Google OAuth, email notifications beyond Supabase Auth, invoice editing/voiding, file deletion, notification preference settings, search/filter/pagination, and request attachments are not implemented yet.
- Dashboard navigation and summary views are implemented, but high-volume reporting, audit log views, and production observability are not configured.
