# Steady30 Web — feature parity spec & wireframes

Status: **draft for approval**. No code written yet.

Source of truth for behaviour: `../Steady30` (Expo SDK 57 + Supabase). Every page below
maps to a real screen, RPC, and table that already exist. Nothing here is invented product.

---

## 1. Decisions taken

| Decision | Choice |
| --- | --- |
| Scope | Full product rebuilt as a web app in this repo (option 3) |
| Framework | Next.js App Router, TypeScript |
| Data | Same Supabase project as the app — same tables, same RPCs, same RLS |
| Paywall | Mirror exactly what ships: only **Weekly Pattern Review** is gated |
| Purchase | Not sold on web. Store purchase only, web reads entitlement |
| Theme | The app's monochrome tokens, light + dark, ported verbatim |

Consequence you should know about: two codebases now implement the same product.
Every RPC contract change has to land in both. The RLS layer is what keeps that safe —
the web client is exactly as untrusted as the mobile one, so parity bugs are UI bugs,
not security bugs.

### Stack

```
next 15 (app router, RSC where it's free)
@supabase/ssr          — cookie-based session, so RSC can read auth
@tanstack/react-query  — same client-side cache the app uses
zod + react-hook-form  — reuse src/lib/validation.ts verbatim
tailwind               — tokens below become CSS variables
```

Reused from the app **without rewriting** (copy or, better, a shared `packages/core`):
`lib/validation.ts`, `lib/moderation.ts`, `lib/patterns.ts`, `lib/date.ts`,
`lib/errors.ts`, `lib/idempotency.ts`, `lib/export.ts`, `types/database.ts`,
`theme/*`. That is ~all the business logic. The web work is layout, not logic.

---

## 2. Design system (ported from `src/theme`)

The current site is sage-green (`#536147`). The app is **pure monochrome**. The site
changes, not the app.

```css
/* light */                      /* dark */
--bg:            #F1F1ED;        #101010
--card:          #FAFAF7;        #1D1D1D
--card-hover:    #E6E6E1;        #292929
--border:        #D2D2CC;        #363636
--border-strong: #B8B8B1;        #4A4A4A
--text:          #181818;        #F2F2EE
--text-muted:    #5F5F5B;        #AAAAA5
--text-subtle:   #85857F;        #777773
--primary:       #181818;        #F2F2EE   /* inverts — this is the whole brand trick */
--on-primary:    #FFFFFF;        #111111
--accent:        #555550;        #AFAFA9
--danger:        #9D3F39;        #E06E66
--warning:       #765B22;        #C6A15B
```

Rules the app follows and the site must too:

- **Colour only where meaning requires it.** Danger = relapse/delete. Warning = deadline.
  Everything else is greyscale. No decorative accent colour anywhere.
- Radius `6 / 10 / 16 / 24 / 999`. Spacing scale `4 8 12 16 20 24 32 40 48 64`.
- Type scale `12 14 16 18 20 24 30 36`; weights `400 500 600 700`; headings `-0.035em`
  tracking, `1.2` line-height; body `1.5`.
- Numerals in streaks/counters use `font-variant-numeric: tabular-nums`.
- Eyebrow labels: 11px, weight 800, letter-spacing 1, uppercase.

### Shell: mobile tabs → desktop sidebar

The app has 4 bottom tabs (Today / Community / Learn / Me). On web:

```
≥1024px                                   <1024px
┌────────┬──────────────────────────┐     ┌────────────────────────┐
│ S30    │                          │     │ ☰  Steady30      ●dark │
│        │                          │     ├────────────────────────┤
│ Today  │      content             │     │                        │
│ Commun │      max-w 760px         │     │      content           │
│ Learn  │      (960 for feeds)     │     │                        │
│ Me     │                          │     │                        │
│        │                          │     ├────────────────────────┤
│ ─────  │                          │     │ Today Commun Learn Me  │
│ Steady │                          │     └────────────────────────┘
│  Now   │                          │        (sticky bottom tabs,
│ ☾ / ☀  │                          │         same as native)
└────────┴──────────────────────────┘
```

`Steady Now` is pinned in the sidebar at all times — in the app it is reachable while
signed out, and it is the one control someone reaches for under pressure.

---

## 3. Route map

🔒 = Steady30 Plus. ● = requires auth. ◐ = public but changes when signed in.

| Route | Auth | Source screen | Data |
| --- | --- | --- | --- |
| `/` | ◐ | `landing-screen` | redirect → `/today` if session + handle |
| `/features` | – | *new (web only)* | static |
| `/plus` | ◐ | `paywall-screen` | entitlement read |
| `/about` | – | `about-screen` | static |
| `/safety` | – | `safety-screen` | static |
| `/privacy` `/terms` `/community-guidelines` | – | existing legal screens | static |
| `/delete-account` | – | `delete-account-public-screen` | `request_public_account_deletion` |
| `/steady-now` | ◐ | `steady-now-screen` | none — nothing is stored |
| `/sign-in` | – | `sign-in-screen` | OTP + Google OAuth |
| `/verify` | – | `verify-screen` | OTP verify |
| `/auth/callback` | – | `auth-callback` | code exchange |
| `/onboarding` | ● | `onboarding-screen` | `profiles` insert |
| `/onboarding/challenge` | ● | `challenge-setup-screen` | `save_challenge_setup` |
| `/today` | ● | `today-dashboard-screen` | `get_today_state` |
| `/check-in/[date]` | ● | `check-in-screen` | `submit_daily_checkin` |
| `/relapse` | ● | `relapse-screen` ⚠ | `record_relapse` |
| `/attempts` | ● | `attempts-history-screen` | `attempts`, `correct_relapse` |
| `/completion` | ● | `completion-screen` | `get_completion_state`, `save_completion_reflection` |
| `/maintenance` | ● | `maintenance` | `submit_maintenance_checkin`, `set_maintenance_enabled` |
| `/weekly-review` | ● 🔒 | `weekly-review-screen` | `daily_checkins`, `coping_plans`, `challenge_preferences` |
| `/learn` | ● | `learn-screen` | `content_items`, `content_progress` |
| `/learn/[slug]` | ● | `lesson-detail-screen` | `content_items` |
| `/tools/[slug]` | ● | `urge-tool-screen` | `coping_plans` (if-then only) |
| `/community` | ● | `community-screen` | `community_feed`, `create_post`, `toggle_reaction`, `report_target` |
| `/community/[id]` | ● | `post-detail-screen` | `post_thread`, `create_comment` |
| `/leaderboard` | ● | `leaderboard-screen` | `leaderboard_current` |
| `/guides` | ● | `guides-screen` | `list_peer_guides` |
| `/guides/me` | ● | `peer-guide-manage-screen` | `my_peer_guide_status`, `apply_peer_guide` |
| `/u/[handle]` | ● | `user-profile-screen` | `public_profiles`, `block_user` |
| `/cohort` | ● | `cohort-screen` | `my_cohort`, `list_open_cohorts`, `join_cohort`, `submit_cohort_weekly_pulse` |
| `/trusted-contacts` | ● | `trusted-contacts-screen` | `invite_trusted_contact`, `respond_to_trusted_contact` |
| `/trusted-support` | ● | `trusted-support-screen` | `send_trusted_support_request` |
| `/me` | ● | `me-screen` | `profiles`, `get_completion_state` |
| `/settings` | ● | `settings-screen` | `profiles` update |
| `/settings/privacy` | ● | `settings-privacy-screen` | `leaderboard_opt_in`, `profile_visibility` |
| `/settings/notifications` | ● | `settings-notifications-screen` | Web Push (see §7) |
| `/settings/data` | ● | `settings-data-screen` | `export.ts`, `execute_account_deletion` |
| `/settings/app` | ● | `widget-settings-screen` → repurposed | PWA install + store links |
| `/admin` | ● admin | `admin-dashboard-screen.web` | already web-specific |
| `/admin/reports` | ● mod | `admin-reports-screen.web` | `moderate_target`, `suspend_user` |
| `/admin/cohorts` | ● admin | `admin-cohorts-screen.web` | `admin_create_cohort`, `admin_set_cohort_status` |
| `/admin/guides` | ● admin | `admin-guides-screen.web` | `admin_review_peer_guide` |
| `/admin/users/[id]` | ● admin | `admin-user-detail-screen.web` | profile + moderation history |

⚠ **Bug found in the app while mapping this**: `relapse-screen.tsx` is orphaned — no
route imports it, so `record_relapse` is unreachable. Today's "Record an honest relapse"
link goes to `/attempts`, which can only *correct* a relapse that was never recordable.
The web build wires `/relapse` properly. Worth fixing in the app too.

---

## 4. Paywall map

Gated today (exactly one thing):

| Feature | Route | Gate |
| --- | --- | --- |
| Weekly Pattern Review | `/weekly-review` | `useSteady30Plus()` → `PlusLockCard` |

Free forever, per the app's own paywall copy: daily check-ins, the 30-day challenge,
community, cohorts, trusted contacts, leaderboard, Learn, Steady Now, safety resources,
data export, deletion.

Advertised on `/plus`, matching `paywall-screen` word for word:

- Advanced private weekly pattern reviews
- Access to every future Steady30 Plus tool
- No ads and no sale of your personal data

"Next for Plus" (explicitly **not** sold as available): custom reminder schedules,
premium widget styles, expanded private planning tools.

### The one blocker

`purchases.web.ts` is a stub — `getPlusStatus()` returns `null` and
`isPurchasesAvailable()` is `false`. So on web today, **a paying subscriber looks
identical to a free user** and Weekly Review would lock for everyone.

Minimum fix, no Stripe, no second paywall:

```
RevenueCat webhook → Supabase edge function → entitlements table (user_id, plus_active, expires_at)
                                                   ↑ RLS: owner reads own row only
web: select from entitlements  ·  app: keeps reading RevenueCat directly
```

`/plus` on web then shows either "Active — manage in Google Play / App Store" or
"Available in the Steady30 app" with store buttons. No purchase button on web.
This is ~1 edge function + 1 migration and it is a prerequisite for the gate to be honest.

---

## 5. Wireframes

Boxes are desktop content column (760px) unless noted. Mobile = same order, one column.

### 5.1 `/` Landing (signed out)

```
┌──────────────────────────────────────────────────────────┐
│ (S) Steady30      Features  Plus  Safety  Privacy   [Sign in]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  PRIVATE · ADULTS 18+                                    │
│                                                          │
│  One honest day                                          │
│  at a time.                                    ┌───────┐ │
│                                                │ Day 12│ │
│  A voluntary 30-day accountability practice    │ ▓▓▓▓░░│ │
│  for adults. No shame, no pressure, no         │ 12/30 │ │
│  pseudoscience.                                └───────┘ │
│                                                 (static  │
│  [ Start my 30 days ]  [ See how it works ]      today   │
│                                                  mock)   │
├──────────────────────────────────────────────────────────┤
│  ▍Private by design.                                     │
│  Reflections are private. Community is optional. No ads, │
│  no sale of personal data, no behavioural analytics.     │
├──────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ A daily  │ │ Support  │ │ Always   │  ← 3 cards       │
│  │ practice │ │ on your  │ │ yours    │                  │
│  │          │ │ terms    │ │          │                  │
│  └──────────┘ └──────────┘ └──────────┘                  │
├──────────────────────────────────────────────────────────┤
│  How it works  ①Set up →②Check in daily →③Review weekly  │
├──────────────────────────────────────────────────────────┤
│  ▍Not medical treatment.  (warning-toned callout)        │
├──────────────────────────────────────────────────────────┤
│  Under pressure right now?   [ Open Steady Now ]         │
│  No account needed. Nothing is saved.                    │
├──────────────────────────────────────────────────────────┤
│ © 2026 Steady30   Privacy Terms Safety Delete Support    │
└──────────────────────────────────────────────────────────┘
```

Signed in with a handle → server-side redirect to `/today`. Signed in without a handle →
`/onboarding`. Same rule as `src/app/index.tsx`.

### 5.2 `/features` (web only)

Index of everything, grouped, each row linking to the deep page. Plus items carry a
`PLUS` chip. This is the page that makes "every feature is on the website" legible.

```
┌──────────────────────────────────────────────────────────┐
│ Everything in Steady30                                   │
│ The core practice is free. One tool is Plus.             │
├──────────────────────────────────────────────────────────┤
│ THE DAILY PRACTICE                                       │
│  ▸ 30-day challenge with your own rule set               │
│  ▸ Daily reflection with a real deadline                 │
│  ▸ Verified + abstinence streaks                         │
│  ▸ Honest reset (relapse) with preserved history         │
│  ▸ Weekly pattern review                          [PLUS] │
├──────────────────────────────────────────────────────────┤
│ IN THE MOMENT                                            │
│  ▸ Steady Now — ten minutes of space   (no account)      │
│  ▸ 3-minute urge surfing · Box breathing · If-then plans │
├──────────────────────────────────────────────────────────┤
│ SUPPORT                                                  │
│  ▸ Text-only community, filtered by stage                │
│  ▸ Synchronized 30-day cohorts                           │
│  ▸ Alumni peer guides                                    │
│  ▸ Opt-in leaderboard · Trusted contacts                 │
├──────────────────────────────────────────────────────────┤
│ LEARN · PRIVACY & CONTROL                                │
│  ▸ Reviewed lessons with evidence levels                 │
│  ▸ Export everything · Delete everything                 │
└──────────────────────────────────────────────────────────┘
```

### 5.3 `/today` — the core screen

Five distinct states, all in `today-dashboard-screen`. Build all five.

```
STATE: active (the main one)
┌──────────────────────────────────────────────────────────┐
│ Good morning                          [ Check-In Open ]  │
│ Day 12 of 30                                             │
├──────────────────────────────────────────────────────────┤
│ Your progress                                    12 / 30 │
│ Day 12                                                   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░                           │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │  06:41:22  until today's reflection closes           │ │
│ │  Notice your mood, triggers, and the response        │ │
│ │  you chose today.                                    │ │
│ │  [ Complete check-in ]                               │ │
│ └──────────────────────────────────────────────────────┘ │
│    ↑ tinted primaryMuted; accentMuted once checked in,   │
│      button becomes "Edit check-in" (outline)            │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐          │
│ │ 12  verified streak │ │ 12  abstinence      │          │
│ │     on-time days    │ │     days            │          │
│ └─────────────────────┘ └─────────────────────┘          │
├──────────────────────────────────────────────────────────┤
│ Your weekly pattern                                      │
│ Review the last seven private check-ins. Reflection      │
│ text is never loaded into the summary.                   │
│ [ Open Weekly Review ]                            [PLUS] │
├──────────────────────────────────────────────────────────┤
│ Need support right now?                                  │
│ [ Steady Now ]                                           │
├──────────────────────────────────────────────────────────┤
│ Today's Lesson                              4 min read   │
│ Why late-night scrolling raises urge intensity           │
│ Summary line, two lines max…                             │
│ [ Read Lesson ]                                          │
├──────────────────────────────────────────────────────────┤
│         Record an honest relapse (resets attempt         │
│              non-judgmentally)   ← danger, underlined    │
└──────────────────────────────────────────────────────────┘

STATE: no_attempt        card "No Active Challenge" + [Start 30-Day Challenge]
STATE: pending           info banner "starts tomorrow 00:00" + 3 setup-day steps
STATE: completed         🎉 accent card + [Day-30 Reflection] [View Milestones]
STATE: loading           skeletons 100 / 80 / 140
```

Desktop only: on ≥1280px the streaks + lesson + weekly-review cards move into a right
rail so the countdown and check-in button stay above the fold. Content order on mobile
is unchanged from the app.

### 5.4 `/check-in/[date]`

```
┌──────────────────────────────────────────────────────────┐
│ ← Daily Reflection                                       │
│   Check-In for 2026-08-11                                │
├──────────────────────────────────────────────────────────┤
│ Today's Overall Mood (1–5)                               │
│  ①  ②  ③  ④  ⑤        1: Depleted → 5: Calm             │
├──────────────────────────────────────────────────────────┤
│ Highest Urge Intensity (0–10)                            │
│  ⓪①②③④⑤⑥⑦⑧⑨⑩       0: Zero urge → 10: Spike        │
├──────────────────────────────────────────────────────────┤
│ Triggers Encountered      select all that applied        │
│ (Boredom / Aimless browsing) (Stress / Anxiety)          │
│ (Loneliness / Isolation) (Fatigue / Late night alone)    │
│ (Overstimulation / Social media cue) (Interpersonal      │
│ conflict) (Habitual routine / Idle time) (No trigger)    │
│    ↑ selected = filled primary, unselected = bordered    │
├──────────────────────────────────────────────────────────┤
│ Coping Actions Used                                      │
│ (3-Min Urge Surfing) (Paced Box Breathing) (If-Then      │
│ Coping Plan) (Physical movement / Walk) (Cold water /    │
│ Grounding) (Changed room) (Phone outside bedroom)        │
│ (Talked to peer / friend) (Read lesson) (No urge today)  │
│    ↑ selected = filled accent                            │
├──────────────────────────────────────────────────────────┤
│ Private Daily Reflection                                 │
│ Visible only to your account. What happened, what        │
│ helped, what will you try tomorrow?                      │
│ ┌──────────────────────────────────────────────────────┐ │
│ │                                                      │ │
│ └──────────────────────────────────────────────── 0/4000│
│                                       min 20 characters │
├──────────────────────────────────────────────────────────┤
│ Optional Public Excerpt                                  │
│ ☐ Share a non-graphic excerpt to Community feed          │
│   Defaults OFF. Never include explicit descriptions,     │
│   outside links, or contact info.                        │
│   └─ when checked: textarea 20–600, client moderation    │
├──────────────────────────────────────────────────────────┤
│ [        Submit Daily Check-In        ]                  │
└──────────────────────────────────────────────────────────┘
```

Idempotency key generated once per form mount, same as the app. Late submit returns
`CHECKIN_TOO_LATE` → danger banner, not a silent failure.

### 5.5 `/weekly-review` 🔒

```
LOCKED                                UNLOCKED
┌──────────────────────────┐          ┌──────────────────────────────────┐
│ ← Weekly Pattern Review  │          │ ← Weekly Pattern Review          │
├──────────────────────────┤          ├──────────────────────────────────┤
│ ┌──────────────────────┐ │          │ Last 7 check-ins                 │
│ │ STEADY30 PLUS        │ │          │ Mood   ▁▃▅▂▆▇▄                   │
│ │ Weekly pattern       │ │          │ Urge   ▆▅▂▇▃▁▂                   │
│ │ review               │ │          │ Aug 5 ────────────── Aug 11      │
│ │                      │ │          ├──────────────────────────────────┤
│ │ See how mood, urges, │ │          │ Lower-mood days appeared          │
│ │ and triggers moved   │ │          │ alongside stronger urges.         │
│ │ across your week.    │ │          ├──────────────────────────────────┤
│ │ [ See Steady30 Plus ]│ │          │ Most frequent trigger  Late night │
│ │                      │ │          │ Hardest day            Aug 8      │
│ └──────────────────────┘ │          │ Most-used coping   Urge surfing   │
│                          │          ├──────────────────────────────────┤
│ Your check-ins are still │          │ Your if-then plans                │
│ recorded. Nothing is     │          │ IF late night alone THEN …        │
│ lost while Plus is off.  │          │ (3 plans, from challenge setup)   │
└──────────────────────────┘          ├──────────────────────────────────┤
                                      │ Reflection text is never loaded   │
                                      │ into this summary.                │
                                      └──────────────────────────────────┘
```

Analysis runs in `lib/patterns.ts` on the client, over `local_date, mood, urge_intensity,
trigger_categories, coping_actions` only — the select list must stay exactly that narrow.

### 5.6 `/steady-now` (public, nothing stored)

Four steps, one page, no route changes.

```
┌──────────────────────────────────────────────────────────┐
│ ← Steady Now                                             │
│   Create ten minutes between urge and action             │
│ ⓘ Private by design: your rating and trigger stay on     │
│   this screen and are not saved or sent.                 │
├──────────────────────────────────────────────────────────┤
│ ①ASSESS  Name what is happening                          │
│ An urge is information, not an instruction.              │
│ Urge right now  ⓪…⑩                                      │
│ (Stress)(Boredom)(Loneliness)(Late night)(Content)(Other)│
│ [ Make ten minutes of space ]                            │
├──────────────────────────────────────────────────────────┤
│ ②DELAY                    09:58                          │
│                     ◜◝ large tabular countdown ◟◞        │
│  [Open paced breathing] [Open 3-min urge surfing]        │
│  [Ask a trusted contact for support]                     │
│  [I'm ready to reassess]                                 │
├──────────────────────────────────────────────────────────┤
│ ③REASSESS  Urge now ⓪…⑩   → before 8 · after 4          │
│ ④COMPLETE  What you did with ten minutes counts.         │
│            [ Start again ]  [ Back to Today ]            │
└──────────────────────────────────────────────────────────┘
```

Timer must survive a backgrounded tab — drive from a wall-clock deadline, not
`setInterval` accumulation.

### 5.7 `/tools/[slug]`

```
urge-surfing            paced-breathing              if-then-plan
┌──────────────────┐   ┌────────────────────────┐   ┌──────────────────────┐
│ 3-Minute Urge    │   │ Paced Box Breathing    │   │ If-Then Coping Plans │
│ Surfing          │   │ 4-4-4-4 rhythm         │   │ Pre-committed        │
│                  │   │                        │   │ implementation       │
│      02:41       │   │     ◯ expanding        │   │ intentions           │
│  ▁▂▃▄▅▆▇▆▅▄▃▂▁   │   │       ring             │   ├──────────────────────┤
│  "Notice where   │   │   Breathe in · 4       │   │ IF [ cue      ] ≤280 │
│   you feel it"   │   │   Hold · 4             │   │ THEN [ action ] ≤280 │
│                  │   │   Out · 4  Hold · 4    │   │  ×3 (exactly three)  │
│ [Start] [Reset]  │   │ [Start] [Pause]        │   │ [ Save Plan ]        │
└──────────────────┘   └────────────────────────┘   └──────────────────────┘
```

Only if-then persists (`coping_plans`). The other two store nothing.

### 5.8 `/community`

```
┌────────────────────────────────────────────────────────────────┐
│ Community Support                              [ + New Post ]  │
│ Encouraging reflections and consistency milestones             │
│ [ Leaderboard ]  [ Peer Guides ]                               │
├────────────────────────────────────────────────────────────────┤
│ (All) (Starting) (Building) (Sustaining) (Alumni)   ← chips    │
├────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ (av) @quiet_river   · Building            ⋯ report / block │ │
│ │ Day 9. The 10pm walk is doing more than I expected.        │ │
│ │ ♡ support 12   💬 3                                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│ … infinite list, text only, no images/links ever               │
└────────────────────────────────────────────────────────────────┘

NEW POST modal                        REPORT modal
┌──────────────────────────────┐      ┌────────────────────────────┐
│ Share with Community         │      │ Report Content             │
│ Stage: (Starting)(Building)  │      │ ○ Explicit sexual content  │
│        (Sustaining)(Alumni)  │      │ ○ Harassment  ○ Hate       │
│ ┌──────────────────────────┐ │      │ ○ Self-harm   ○ Spam       │
│ │ text only, 20–600        │ │      │ ○ Contact solicitation     │
│ └──────────────────────────┘ │      │ ○ Misinformation ○ Other   │
│ No links, contact info, or   │      │ Detail (optional)          │
│ explicit description.        │      │ [ Submit Report ]          │
│ [ Publish Post ]             │      └────────────────────────────┘
└──────────────────────────────┘
```

Client moderation (`lib/moderation.ts`) runs before submit; server `create_post` is the
real gate. Posts land `pending` or `published` per the moderation pipeline — the UI must
show "in review" rather than pretending it's live.

### 5.9 `/community/[id]`, `/leaderboard`, `/guides`, `/u/[handle]`

```
POST THREAD                          LEADERBOARD
┌───────────────────────────┐        ┌──────────────────────────────┐
│ ← Discussion              │        │ Leaderboard                  │
│   Thread with @handle     │        │ Opt-in verified streaks      │
├───────────────────────────┤        │ ⓘ Only members who opted in  │
│ [original post card]      │        ├──────────────────────────────┤
├───────────────────────────┤        │ 1  (av) @steady_pine    28 d │
│ (av) @other  · 2h         │        │ 2  (av) @quiet_river    24 d │
│ comment body…             │        │ 3  (av) @you       ★    21 d │
│ …                         │        │ …                            │
├───────────────────────────┤        ├──────────────────────────────┤
│ [ write a comment      ]  │        │ Not listed? Turn on in       │
│ [ Add Comment ]           │        │ Privacy & Visibility.        │
└───────────────────────────┘        └──────────────────────────────┘

PEER GUIDES                          PUBLIC PROFILE /u/[handle]
┌───────────────────────────┐        ┌──────────────────────────────┐
│ Peer Guides               │        │ (av) Display name            │
│ Alumni offering public    │        │      @handle  · GUIDE        │
│ community encouragement   │        │ Joined Mar 2026              │
├───────────────────────────┤        ├──────────────────────────────┤
│ (av) @name        GUIDE   │        │ Completed challenges     2   │
│ "public statement…"       │        │ Verified streak         21 d │
│ [ View Public Profile ]   │        │ Abstinence streak       21 d │
│ …                         │        ├──────────────────────────────┤
├───────────────────────────┤        │ bio…                         │
│ Guides are volunteers,    │        │ [ Block ] [ Report ]         │
│ not clinicians.           │        └──────────────────────────────┘
└───────────────────────────┘        respects profile_visibility:
                                     private → 404-style empty state
```

### 5.10 `/cohort`

```
NOT IN A COHORT                       IN A COHORT
┌────────────────────────────┐        ┌──────────────────────────────────┐
│ 30-Day Cohorts             │        │ My 30-Day Cohort                 │
│ Synchronized small-group   │        │ August Cohort · Week 2 of 5      │
│ accountability             │        ├──────────────────────────────────┤
├────────────────────────────┤        │ Aug 1 ──●───────── Aug 30        │
│ ┌────────────────────────┐ │        ├──────────────────────────────────┤
│ │ August Cohort          │ │        │ This week's pulse                │
│ │ Aug 1 – Aug 30         │ │        │ ○ Steady — moving forward        │
│ │ 14 / 20 members        │ │        │ ○ Return — resetting             │
│ │ 6 spots remaining      │ │        │ ○ Encouragement — working through│
│ │ [ Join Cohort ]        │ │        │ 11 of 14 members shared          │
│ └────────────────────────┘ │        ├──────────────────────────────────┤
│ …more open cohorts         │        │ Roster (handles only)            │
├────────────────────────────┤        │ (av)@a (av)@b (av)@you …         │
│ You keep your own start    │        ├──────────────────────────────────┤
│ date and privacy.          │        │ Weekly prompt                    │
└────────────────────────────┘        │ "…" from cohort_weekly_review    │
                                      ├──────────────────────────────────┤
JOIN / LEAVE = confirm modal          │ [ Leave Cohort ]  (danger, modal)│
                                      └──────────────────────────────────┘
```

Roster shows handle + display name only. No streaks, no check-in status, no progress —
that would leak sensitive behaviour to a group.

### 5.11 `/learn` and `/learn/[slug]`

```
┌──────────────────────────────────────────────────────────┐
│ Learn & Practice                                         │
│ Reviewed lessons and practical coping tools              │
├──────────────────────────────────────────────────────────┤
│ Interactive Coping Tools                                 │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                │
│ │ 🌊        │ │ 🫁        │ │ 🧭        │                │
│ │ Urge      │ │ Box       │ │ If-Then   │                │
│ │ Surfing   │ │ Breathing │ │ Plans     │                │
│ │ 3-min     │ │ 4-4-4-4   │ │ pre-commit│                │
│ └───────────┘ └───────────┘ └───────────┘                │
├──────────────────────────────────────────────────────────┤
│ 30-day lesson track                                      │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ DAY 1  Why you're doing this          4 min    ✓done │ │
│ │ DAY 2  Urges are waves, not orders    5 min          │ │
│ │ …                                                    │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

LESSON DETAIL
┌──────────────────────────────────────────────────────────┐
│ ← Lesson                                    DAY 2 · 5 min│
│ Urges are waves, not orders                              │
│ ┌──── evidence panel ─────────────────────────────────┐  │
│ │ Evidence level: Emerging   Reviewed by …, Mar 2026  │  │
│ │ Intended outcome: …    Limitations: …               │  │
│ └─────────────────────────────────────────────────────┘  │
│ markdown body…                                           │
│ Sources: 1. … 2. …                                       │
│ [ Mark Lesson as Completed ]                             │
└──────────────────────────────────────────────────────────┘
```

The evidence panel is not decoration — `content_items` carries `evidence_level`,
`limitations`, `reviewer_credentials`, `review_expires_at`. Render all of it. Content
still in `review_status: 'draft'` gets a visible "not yet reviewed" banner.

### 5.12 `/relapse` and `/attempts`

```
RECORD AN HONEST RESET                CHALLENGE HISTORY
┌──────────────────────────────┐      ┌────────────────────────────────┐
│ ← Record an Honest Reset     │      │ ← Challenge History            │
│   Self-compassion and        │      │   Preserved journey            │
│   preserved history          │      ├────────────────────────────────┤
├──────────────────────────────┤      │ [ Start New Challenge ]        │
│ ⓘ Your history is preserved. │      ├────────────────────────────────┤
│   A reset is data, not a     │      │ ┌────────────────────────────┐ │
│   verdict.                   │      │ │ Aug 1 – Aug 12   RELAPSE   │ │
│ Categories (multi-select)    │      │ │ 11 of 30 days              │ │
│ Private note (optional)      │      │ │ [Correct an accidental     │ │
│ ┌──────────────────────────┐ │      │ │  relapse entry]            │ │
│ └──────────────────────────┘ │      │ └────────────────────────────┘ │
│ Never shared. Never public.  │      │ ┌────────────────────────────┐ │
│ [ Confirm Honest Reset ]     │      │ │ Jun 1 – Jun 30 ✓COMPLETED  │ │
│   ↑ danger, confirm modal    │      │ │ [Completion reflection &   │ │
└──────────────────────────────┘      │ │  maintenance]              │ │
                                      │ └────────────────────────────┘ │
                                      └────────────────────────────────┘
```

### 5.13 `/completion` and `/maintenance`

```
┌──────────────────────────────────────────────────────────┐
│ ← Completion & Maintenance                               │
│   Private milestone and voluntary routine                │
├──────────────────────────────────────────────────────────┤
│ 30 on-time reflections · Jun 1 – Jun 30                  │
├──────────────────────────────────────────────────────────┤
│ What actually helped?  (multi-select, 6 practices)       │
│ ☐ Consistent sleep & wake routine                        │
│ ☐ Daily movement & outdoor time                          │
│ ☐ Phone outside bedroom & device boundaries              │
│ ☐ Trusted accountability & talking with peers            │
│ ☐ Urge surfing, breathing, if-then plans                 │
│ ☐ Engaging hobbies, work, meaningful goals               │
├──────────────────────────────────────────────────────────┤
│ Private closing note (optional)                          │
├──────────────────────────────────────────────────────────┤
│ What's next?                                             │
│ ○ Take a private pause and consolidate routines          │
│ ○ Continue in low-pressure maintenance mode              │
│    └ cadence: ○ Weekly  ○ Monthly                        │
│ ○ Start a new 30-day challenge tomorrow                  │
│ [ Save Reflection ]     [ Download completion export ]   │
└──────────────────────────────────────────────────────────┘

/maintenance — recurring, low pressure
┌──────────────────────────────────────────────────────────┐
│ Maintenance                     Weekly · next Sun        │
│ How are things?                                          │
│ ○ Grounded & steady — habits holding well                │
│ ○ Urges / elevated tension — applying coping tools       │
│ ○ Refocusing after friction — recommitting               │
│ Private note (optional)          [ Save check-in ]       │
│ Recent: ● ● ○ ● ● (last 5)   [ Turn maintenance off ]    │
└──────────────────────────────────────────────────────────┘
```

### 5.14 Trusted contacts + support

```
/trusted-contacts                     /trusted-support
┌──────────────────────────────┐      ┌────────────────────────────────┐
│ Trusted Contacts             │      │ Trusted Support                │
│ Supportive accountability    │      │ Ask a trusted contact for      │
│ without surveillance         │      │ support                        │
├──────────────────────────────┤      ├────────────────────────────────┤
│ ⓘ Trusted contacts only see  │      │ ⓘ They receive a neutral       │
│   a support request you      │      │   "I need support" signal.     │
│   choose to send. Never      │      │   No reflections, triggers,    │
│   reflections, triggers,     │      │   urge ratings, or relapse     │
│   urges, missed check-ins,   │      │   records are shared.          │
│   or relapse records.        │      ├────────────────────────────────┤
│ ⓘ In-app only. No email,     │      │ Send to:                       │
│   SMS, or push is sent.      │      │  ○ @friend_handle              │
├──────────────────────────────┤      │  ○ @other_handle               │
│ Invite by handle             │      │ [ Send support request ]       │
│ [ challenger_alex   ] [Send] │      ├────────────────────────────────┤
├──────────────────────────────┤      │ Requests to you                │
│ Pending  @a  [Accept][Decline]│     │ @friend needs support · 2h     │
│ Accepted @b  [Revoke]        │      │ [ Acknowledge ]                │
└──────────────────────────────┘      └────────────────────────────────┘
```

### 5.15 `/me` and settings

```
┌──────────────────────────────────────────────────────────┐
│ My Account                                               │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ (AV)  Display name                                   │ │
│ │  54   @handle          [Timezone: Asia/Kolkata]      │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Steady30 Plus                                     →  │ │ ← primary-coloured
│ │ Completion & Maintenance  (if completed attempt)  →  │ │
│ │ Alumni Peer Guide                                 →  │ │
│ │ Community Peer Guides                             →  │ │
│ │ My 30-day cohort                                  →  │ │
│ │ Weekly Pattern Review                       [PLUS]→  │ │
│ │ Trusted Contacts                                  →  │ │
│ │ Challenge History & Milestones                    →  │ │
│ │ Settings & Profile Edit                           →  │ │
│ │ Privacy & Visibility                              →  │ │
│ │ Reflection Reminders                              →  │ │
│ │ Install Steady30                                  →  │ │ ← replaces "widget"
│ │ Export Data & Account Deletion                    →  │ │
│ └──────────────────────────────────────────────────────┘ │
│ [ Sign Out ]                                             │
└──────────────────────────────────────────────────────────┘

/settings            display name, bio, timezone, theme (light/dark/system)
/settings/privacy    ☐ show handle on public leaderboard (default OFF)
                     profile visibility: private / members / public
/settings/notifications  ☐ daily 20:00 reflection reminder  (see §7)
/settings/data       [ Download Data Export ]  → JSON, client-built
                     [ Delete My Account ]     → danger, type-to-confirm modal
                       "Permanently deletes reflections, check-ins, posts,
                        comments, and profile. This cannot be undone."
/settings/app        PWA install prompt + Google Play / App Store links
                     Home-screen widget: available in the mobile app only
```

### 5.16 `/plus`

```
┌──────────────────────────────────────────────────────────┐
│ ← Steady30 Plus                                          │
│   More private support, never pressure                   │
├──────────────────────────────────────────────────────────┤
│ ┌─ bordered in --primary ───────────────────────────────┐│
│ │ OPTIONAL MEMBERSHIP                                   ││
│ │ Keep the core challenge free.                         ││
│ │ Plus adds deeper private tools. Daily check-ins, the  ││
│ │ 30-day challenge, community support, trusted contacts,││
│ │ and safety resources always remain free.              ││
│ └───────────────────────────────────────────────────────┘│
│ ✓ Advanced private weekly pattern reviews                │
│ ✓ Access to every future Steady30 Plus tool              │
│ ✓ No ads and no sale of your personal data               │
├──────────────────────────────────────────────────────────┤
│ NEXT FOR PLUS                                            │
│ Custom reminder schedules, premium widget styles, and    │
│ expanded private planning tools are next on the roadmap. │
│ They are not available yet.                              │
├──────────────────────────────────────────────────────────┤
│ state = active   ✓ Steady30 Plus is active. Manage or    │
│                    cancel in Google Play / App Store.    │
│ state = inactive ⓘ Plus is purchased in the Steady30     │
│                    mobile app.  [Google Play][App Store] │
├──────────────────────────────────────────────────────────┤
│ Pricing, trial terms, and renewal are shown by the store │
│ before you confirm. Steady30 does not sell personal      │
│ reflections or behavioral data.                          │
└──────────────────────────────────────────────────────────┘
```

### 5.17 Auth + onboarding

```
/sign-in                              /onboarding
┌──────────────────────────┐          ┌────────────────────────────────┐
│ Sign In or Join          │          │ Welcome to Steady30            │
│ Passwordless email       │          │ Set up your profile and consent│
├──────────────────────────┤          ├────────────────────────────────┤
│ Email [               ]  │          │ Handle    @[            ]      │
│ [ Send Verification Code]│          │  pseudonymous, 3–20, public    │
│ ──────── or ──────────   │          │ Display name (optional)        │
│ [ Continue with Google ] │          │ Timezone  [ auto-detected  ▾]  │
├──────────────────────────┤          ├────────────────────────────────┤
│ 18+ only. By continuing  │          │ ☐ I am 18 or older             │
│ you accept the Terms and │          │ ☐ I accept the Terms           │
│ Privacy Policy.          │          │ ☐ I accept Community Guidelines│
└──────────────────────────┘          │ ☐ I accept the Privacy Policy  │
/verify  6-digit OTP boxes,           │ [ Continue to Challenge Setup ]│
         resend timer, wrong-code err  └────────────────────────────────┘

/onboarding/challenge — "Shape Your 30 Days"
┌──────────────────────────────────────────────────────────┐
│ ① Goal scope     ○ Pornography ○ Masturbation ○ Both     │
│ ② Why this matters   textarea, min 20 / max 500          │
│ ③ High-risk times    (Morning)(Afternoon)(Evening)       │
│                      (Late night)(Unpredictable)  ≥1     │
│ ④ Anticipated triggers   same 7 chips, ≥1                │
│ ⑤ Support style  ○ Private ○ Community ○ Balanced        │
│ ⑥ Three if-then plans (exactly 3, required)              │
│    IF [            ] THEN [                ]  ×3         │
│ [ Start my 30 days ]  → starts at next local midnight    │
└──────────────────────────────────────────────────────────┘
```

Wizard on mobile (6 steps, progress dots), single scrolling form on desktop. Same Zod
schema either way.

### 5.18 Admin

`admin-*-screen.web.tsx` already exists and is already web-styled — port nearly as-is
into a `/admin` layout with a secondary nav. Role gate: `profiles.role in (moderator, admin)`,
enforced server-side in a layout, and again by RLS.

```
┌──────────┬───────────────────────────────────────────────┐
│ Overview │ Reports queue                                 │
│ Reports  │ (Open)(Reviewed)(Dismissed)(Actioned)         │
│ Cohorts  │ ┌───────────────────────────────────────────┐ │
│ Guides   │ │ URGENT · self_harm · due in 2h            │ │
│          │ │ post ‹id› by @handle                      │ │
│          │ │ "reported body text…"                     │ │
│          │ │ [Hide][Reject][Remove][Dismiss][Suspend]  │ │
│          │ │ reason code ▾   internal note             │ │
│          │ └───────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────┘
Cohorts: create (title, start, capacity), activate/complete/cancel + reason code
Guides:  pending applications → approve / pause / revoke + reason code
Users:   profile, role, suspension, moderation history
```

Every admin mutation writes `moderation_actions` / `cohort_admin_actions` /
`peer_guide_actions`. The UI must always require a reason code — the runbook in
`docs/operations/moderation-runbook.md` depends on it.

---

## 6. Empty, loading, error states

Not optional, and the app already defines them:

- Loading → skeletons at the real content heights, never spinners on full pages.
- Error → `Banner variant="danger"` with `formatErrorMessage(err)`; never a raw
  Postgres error string.
- Empty feed / leaderboard / cohorts / guides → one sentence plus the action that fills it.
- Offline / RPC failure on `/today` → keep the last cached state visible, banner above it.
  Never show "Day 1" to someone on day 19 because a fetch failed.

---

## 7. What does not port, and what replaces it

| App capability | Web |
| --- | --- |
| `expo-notifications` 20:00 local reminder | Web Push (service worker + VAPID). Needs a `push_subscriptions` table. **P1, not P0** — ship `/settings/notifications` with an honest "available in the mobile app" state first. |
| Home-screen widget (iOS/Android) | Not possible. `/settings/app` offers PWA install + store links instead. |
| RevenueCat purchase | Not possible on web. Entitlement read-only via the webhook bridge in §4. |
| `expo-secure-store`, haptics | n/a — httpOnly cookie session, no haptics. |
| `expo-sharing` export | Browser download (`export.ts` already builds the payload). |

---

## 7b. One account, both clients

Requirement: sign in on the website with an account created in the app (or the reverse)
and see the same streak, the same day number, the same history — with progress made on
either client showing up on the other.

This is free by construction, and deliberately so:

- Both clients authenticate against **the same Supabase project**, so one email is one
  `auth.users` row and one `profiles` row.
- Streaks, day numbers, and deadlines are **never computed on a device**. `get_today_state`
  derives all of them server-side from `attempts` and `daily_checkins`. A web check-in and a
  phone check-in write the same rows through the same RPC, so neither client can hold a
  stale or divergent streak — the worst case is a cached render, fixed by a refetch.
- `submit_daily_checkin` is idempotency-keyed, so the same day submitted from two devices
  cannot double-count.

Three things must be true for it to actually work, and two are not true today.

### a. Both clients must point at the same project

You approved staging-first for the web build. While the website is on staging and the
released app is on production, **nothing syncs** — a real app user signing into the website
would see an empty account. That is correct for development and wrong for launch. So:
staging through phases 1–5, then cut `NEXT_PUBLIC_SUPABASE_*` over to production before
the web build is exposed to real users, and make "sign in on web with a production app
account, see the right streak" an explicit release check.

### b. Identity linking — analysed, and now defended in depth

**What the schema actually does.** `public.profiles.id` is a 1:1 foreign key to
`auth.users.id`, and there is **no database trigger creating profiles** — the client
inserts the row during onboarding. `profiles` has no email column, so neither client
can tell that an address already belongs to an account.

**So the failure runs like this.** GoTrue produces a second `auth.users` row for one
person (email-OTP signup, later Google sign-in, identities not linked). That new user
id has no profile, so they land on `/onboarding`. They type the handle they already
use, and the only thing that stops them is `profiles.handle UNIQUE` — which surfaces
as **"that handle is already taken"** on their own handle. If they shrug and pick a
different one, they now own two profiles, two streaks, and two attempt histories, with
no supported way to merge them.

The unique constraint was accidentally preventing silent duplication while producing a
dead end that reads like data loss.

**Three defences, in order of how early they catch it:**

1. **Dashboard (owner task, still required).** Authentication → enable identity linking
   on verified email, so Google and email-OTP resolve to one user. Everything below is
   a backstop for when this is wrong, not a replacement for it.
2. **`account_email_conflict()`** — new `SECURITY DEFINER` RPC. Lets a signed-in member
   ask whether their *own* email is attached to another auth user, and which providers
   those use. Onboarding calls it before blaming the handle, and shows a recovery
   screen: sign out, come back with the other method, nothing was created.
3. **`trg_guard_duplicate_account_profile`** — `BEFORE INSERT` trigger on `profiles`
   that refuses a second profile for one email and raises `DUPLICATE_ACCOUNT_EMAIL`.
   If linking is configured correctly it never fires; if it is not, permanent data
   duplication becomes one clear error.

Migration: `../Steady30/supabase/migrations/20260811000001_duplicate_account_guard.sql`.
It has not been run — it needs a local Postgres and a two-identity test.

### c. Email OTP does not currently work — but the web can route around it

`docs/operations/google-sign-in-setup.md` records that this project's Supabase email
templates send `{{ .ConfirmationURL }}`, not `{{ .Token }}`. The native app asks for a
6-digit code, so **email sign-in is unusable in the app** until the templates change.

A browser has no such limitation. `/auth/callback` therefore accepts both shapes —
`?code=` for OAuth/PKCE and `?token_hash=&type=` for an email link — and `signInWithOtp`
passes `emailRedirectTo` so the link returns to the website. Email sign-in works on the
web today, whichever way the template is configured, and keeps working after it is fixed.

### d. Timezone must not be silently rewritten

The app offers email OTP and Google. So does the web. If someone signs up in the app with
email OTP and later uses *Continue with Google* on the website with that same address,
Supabase only resolves those to one user when identity linking on a verified email is
enabled for the project. If it is off, they get a second `auth.users` row — a second
profile, a second streak, and a support ticket that reads like data loss.

**Action:** confirm the setting in the Supabase dashboard before phase 2 ships sign-in, and
cover it with a two-provider test on staging.



Deadlines and on-time streaks are computed against `profiles.preferred_timezone` and the
attempt's stored `timezone`. Onboarding auto-detects the timezone, which is right once.

It must **not** be re-detected on every web sign-in. Someone whose phone is set to
`Asia/Kolkata` and who opens the website on a work laptop in another timezone would have
their deadline moved under them — potentially closing today's window early and breaking a
verified streak they had actually earned. The web client therefore:

- writes `preferred_timezone` during onboarding only;
- on later sign-ins, if the browser timezone differs, shows a dismissible banner offering
  an explicit change, and changes nothing unless the person chooses it;
- never alters the `timezone` recorded on an in-flight attempt.

### What is genuinely per-device

Not everything should sync, and pretending otherwise would be a privacy regression:

| Stays local | Why |
| --- | --- |
| Theme choice | A preference, not account data — `localStorage`. |
| Reflection reminders | Local notifications on the phone; Web Push is a separate subscription per browser. |
| Steady Now state | Stores nothing, anywhere, by design. |
| Plus entitlement | Read from the entitlements bridge (§4), not synced by the client. |

---

## 8. Non-negotiables carried over from `AGENTS.md`

- Reflections, relapse notes, triggers, and urge ratings are **special-category data**.
  Never in a URL, never in a query string, never in an analytics call, never in a log,
  never on a public Realtime channel. `/check-in/[date]` carries a date, never content.
- Text-only UGC. No image/video/audio/link uploads. No DMs.
- Only `NEXT_PUBLIC_SUPABASE_*` publishable keys client-side. Service-role stays in edge
  functions.
- Streaks, deadlines, and ranks are computed server-side. The web client never derives
  them, same as the mobile client.
- Every page that touches sensitive data is `no-store`; nothing sensitive is prerendered
  or ISR-cached.

---

## 9. Build order

1. Shell, tokens, auth, `/`, legal pages, `/steady-now` — public surface, no data risk.
2. Onboarding → `/today` → `/check-in` → `/relapse` → `/attempts`. The product's spine.
3. `/learn`, `/tools/*`, `/completion`, `/maintenance`.
4. Community, `/cohort`, `/leaderboard`, `/guides`, `/u/[handle]`, trusted contacts.
5. Entitlement bridge → `/plus` → `/weekly-review` gate.
6. `/me` + settings + export/delete.
7. `/admin`.

---

## 10. Open questions

1. **Shared code**: copy `lib/` into this repo, or restructure both into a monorepo with
   `packages/core`? Copying is faster now and drifts later. Recommendation: copy for
   step 1–2, extract the package before step 4.
2. The entitlement webhook (§4) — confirm this is in scope, since without it the Plus
   gate is dishonest on web.
3. Does the web app share the **production** Supabase project from day one, or a staging
   project until the adversarial RLS scenarios in `README.md` have actually been run?
