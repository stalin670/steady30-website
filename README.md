# Steady30 web

The Steady30 product on the web, built to feature parity with the Expo app in
`../Steady30`. Same Supabase project, same RPCs, same RLS, same monochrome theme,
same paywall.

Spec and wireframes: [`docs/web-app-spec.md`](docs/web-app-spec.md).

## Stack

Next.js (App Router) · TypeScript · Tailwind 4 · Supabase (SSR auth)

## Local development

```sh
cp .env.example .env.local   # point at the STAGING Supabase project
npm install
npm run dev
```

The public marketing pages render without Supabase credentials, so `npm run dev` works
on a machine with no `.env.local` at all.

```sh
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Build phases

**Phase 1 — foundation and public surface**

| Route | |
| --- | --- |
| `/` | landing; redirects to `/today` or `/onboarding` when signed in |
| `/features` | full feature index, with Plus marked |
| `/about` | evidence and content standards |
| `/steady-now` | ten-minute urge tool — public, stores nothing |
| `/privacy` `/terms` `/safety` `/community-guidelines` `/delete-account` | legal surface |

**Phase 2 — auth and onboarding**

| Route | |
| --- | --- |
| `/sign-in` | email OTP and Google |
| `/verify` | 6-digit code, with resend |
| `/auth/callback` | OAuth code exchange (server-side) |
| `/onboarding` | handle, timezone, four consents |
| `/onboarding/challenge` | six-part setup, three required if-then plans, starts the attempt |

**Phase 3 — the daily spine**

| Route | |
| --- | --- |
| `/today` | five states: active, no attempt, pending, completed, load failure |
| `/check-in/[date]` | mood, urge, triggers, coping, private reflection, optional public excerpt |
| `/relapse` | honest reset — the route that is unreachable in the app today |
| `/attempts` | challenge history and relapse correction |

The app shell lands here too: bottom tabs on mobile, a left rail from 1024px, with
Steady Now pinned. Community, Learn, and Me appear as inert tabs until their phases.

Public CTAs now point at `/sign-in`.

**Phase 4 — learn, tools, completion**

| Route | |
| --- | --- |
| `/learn` | lesson track with completion state, plus the three coping tools |
| `/learn/[slug]` | lesson with its full evidence panel and sources |
| `/tools/[slug]` | urge surfing, box breathing, if-then plans |
| `/completion` | day-30 reflection and maintenance mode |
| `/maintenance` | redirects to `/completion` — one screen, as in the app |

**Phase 5 — community and support**

| Route | |
| --- | --- |
| `/community` | stage-filtered feed, composer, reactions, reporting |
| `/community/[id]` | thread and replies |
| `/leaderboard` | opt-in verified streaks only |
| `/guides` `/guides/me` | peer guide directory, application and statement |
| `/u/[handle]` | public profile, blocking |
| `/cohort` | my cohort, weekly pulse, roster, open cohorts |
| `/trusted-contacts` | invite, respond, revoke, ask for support |
| `/trusted-support` | redirects to `/trusted-contacts` — one surface on web |

**Phase 6 — entitlement bridge and the paywall**

| Route | |
| --- | --- |
| `/plus` | **public** pricing page; shows active state when signed in |
| `/weekly-review` | gated on Plus; locked state explains nothing is lost |

The bridge (both files are in the app repo and **have not been deployed**):

- `supabase/migrations/20260811000002_plus_entitlements.sql` — `plus_entitlements`
  mirror table, RLS (own row, read-only), and `is_plus_active()`.
- `supabase/functions/revenuecat-webhook/index.ts` — verifies a shared secret,
  ignores anonymous ids, drops stale out-of-order events, upserts with the
  service-role key.

RevenueCat is configured with `appUserID` = the Supabase user id, so webhook events
map straight onto `auth.users`. RevenueCat stays the billing source of truth; this
table only mirrors it, and nothing in it can grant Plus on its own.

**Phase 7 — account, settings, export, deletion**

| Route | |
| --- | --- |
| `/me` | account hub, same order as the app's Me tab |
| `/settings` | display name, bio, timezone, theme |
| `/settings/privacy` | leaderboard opt-in, profile visibility |
| `/settings/notifications` | honest "mobile app only" state — no dead toggle |
| `/settings/data` | JSON export and permanent deletion |
| `/settings/app` | PWA install and store links (replaces the widget screen) |

Two things worth knowing here:

- **Timezone changes only when a member chooses it.** `/settings` shows a banner when
  the browser reports a different zone but changes nothing on its own — auto-detecting
  would move someone's deadline and could break an earned streak. See §7b(d).
- **Deletion is type-to-confirm**, not a checkbox, and the page tells you to export
  first. It is immediate and irreversible.

**Phase 8 — admin and moderation**

| Route | Access | |
| --- | --- | --- |
| `/admin` | moderator+ | queue counts and duty reminders |
| `/admin/reports` | moderator+ | open reports ordered by response deadline |
| `/admin/cohorts` | admin | create cohorts, move them through their lifecycle |
| `/admin/guides` | admin | approve, pause, revoke peer guides |
| `/admin/users/[id]` | moderator+ | member record, suspension, moderation history |

Every console action carries a reason code and writes an internal note, because the
moderation runbook reads them. Staff can see reported content and handles; check-ins,
reflections, mood, urges, and relapse notes are never exposed to the console, and the
member record says so explicitly.

`requireStaff()` is convenience, not enforcement — every admin RPC re-checks the
caller's role and RLS restricts the tables underneath.

## Status

All eight phases are built: 46 routes, feature parity with the app plus the entitlement
bridge the app did not have.

**None of it has run against a database.** See "Not yet exercised" above — that remains
the single blocking item before any of this is real.

## Account safety: one person, one account

`profiles.id` is 1:1 with `auth.users.id` and profiles are created by the client, so a
second auth identity for the same person would fork their streak permanently. Three
defences, detailed in `docs/web-app-spec.md` §7b:

1. Identity linking enabled in the Supabase dashboard — **still an owner task**.
2. `account_email_conflict()` — onboarding explains the situation instead of showing a
   handle collision.
3. `trg_guard_duplicate_account_profile` — refuses the second profile outright.

Migration lives in `../Steady30/supabase/migrations/20260811000001_duplicate_account_guard.sql`
and **has not been run**.

### Not yet exercised

Every authenticated route is built and typechecked, and the auth gate is verified, but
**no phase 2 or 3 screen has ever run against a real database.** They need a staging
Supabase project. Until then, treat the daily spine as unproven.

## Shared code

`src/lib/core/` holds copies of the app's pure logic modules — validation schemas,
error copy, idempotency keys. They are byte-identical to `../Steady30/src/lib/*` on
purpose; see [`src/lib/core/README.md`](src/lib/core/README.md) before editing either
side.

## Rules that are not negotiable

Check-ins, reflections, relapse notes, and urge ratings are special-category data.

- Sensitive values never appear in a URL, log, analytics call, or public Realtime channel.
- Every authenticated route is `no-store`. Nothing sensitive is prerendered or CDN-cached.
- Only publishable keys in `NEXT_PUBLIC_*`. Service-role keys live in edge functions.
- Streaks, deadlines, and ranks are computed server-side. This client derives none of them.
- Product analytics stay disabled, as in the app.

See `../Steady30/AGENTS.md` for the full set.

## Deployment

Vercel, from this repository.

`vercel.json` pins the framework to `nextjs`. This matters because the project was
originally created for the static HTML site, so its Framework Preset was "Other" —
which makes Vercel look for a `public/` directory and fail with:

> No Output Directory named "public" found after the Build completed.

Next.js builds to `.next`, not `public/`. If a deploy still fails after this file
lands, the dashboard has an explicit **Output Directory** override that needs
clearing: Project Settings → Build & Deployment → Output Directory → clear the
override, and set Framework Preset to Next.js. Leave Output Directory blank —
Next.js deployments on Vercel should not set it.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in project settings —
staging until the adversarial RLS scenarios in `../Steady30/README.md` have been run
against a real Postgres instance. Without them the public pages still render and
`/sign-in` shows a "not configured" state; nobody can sign in.

The policy copy is an operational draft based on the app's current behaviour, not legal
advice. Have it reviewed before a production launch.
