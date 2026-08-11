# `src/lib/core` — copied from the app

These files are **copies** of `../Steady30/src/lib/*`, not originals. They are pure
TypeScript with no React Native imports, so they port byte-for-byte.

Keeping them identical is what stops the two clients drifting on validation rules,
error copy, and idempotency behaviour. If you change one of these, change the app's
copy in the same commit.

| File | Source |
| --- | --- |
| `validation.ts` | `../Steady30/src/lib/validation.ts` |
| `errors.ts` | `../Steady30/src/lib/errors.ts` |
| `idempotency.ts` | `../Steady30/src/lib/idempotency.ts` |
| `date.ts` | subset of `../Steady30/src/lib/date.ts` — Intl-only helpers, see the note in the file |

Per `docs/web-app-spec.md` §10, this copy is deliberate for phases 1–3. Extract a shared
`packages/core` before phase 5, when the community validation rules start mattering in
both places at once.

Verify they are still in sync:

```sh
diff src/lib/core/validation.ts ../Steady30/src/lib/validation.ts
diff src/lib/core/errors.ts ../Steady30/src/lib/errors.ts
diff src/lib/core/idempotency.ts ../Steady30/src/lib/idempotency.ts
```
