# S2 Trial Ready

## Current State

- Branch: `s2-adventure-map`
- Latest code commit before this document: `5008a7a fix: polish child-facing pilot and report wording`
- Freeze check: `RC7_FREEZE_REPORT.md`
- Status: ready for limited real trial

## Local Validation

- `npm run typecheck`: passed
- `npm run check`: passed, no warnings
- `npm run build`: passed

## Remote CI

- Workflow: `CI`
- Trigger: push to `s2-adventure-map`
- Run: https://github.com/guxingzyj-stack/AI-jiaoyu/actions/runs/26703754211
- Result: passed
- Job: `validate`
- Steps:
  - `npm ci`: passed
  - `npm run typecheck`: passed
  - `npm run check`: passed
  - `npm run build`: passed

## Trial Entry Points

Recommended order:

1. `/pilot` - S1.5 tutorial island entry
2. `/map` - S2 world map entry
3. `/adventure/multiples-sea` - Multiples Sea new island adventure
4. `/adventure/forest-island` - Forest Island adventure

## What Is Ready

- S1.5 low-grade tutorial flow remains available.
- S2 world map route is available.
- Configurable 7-Beat AdventureRunner is available.
- Multiples Sea and Forest Island are available.
- Beat 7 reflection API exists and can fall back when no real key is configured.
- Minimal GitHub Actions CI is active.
- `.env.local` remains ignored.
- `.env.local.example` contains placeholders only.

## Known Non-Blocking Issues

- `AdventureRunner` still has no automated tests.
- L1/L2/L3 help is still not connected to real AI.
- Real child trial should still include manual full-flow clicking before the session.
- Some visual details can continue to be polished later, but there is no current blocker.
- GitHub Actions has passed for commit `5008a7a`; this document commit will trigger a new CI run after push.

## Do Not Do Before This Trial

- Do not expand to a 15-minute full version.
- Do not add a database or login.
- Do not add a new AI feature.
- Do not regenerate image assets unless a blocker is found.
- Do not refactor AdventureRunner before collecting trial feedback.
- Do not add a testing framework just before the trial.

## Trial Recommendation

Proceed with a limited real trial.

Reason: local validation passes, remote CI passes, key routes and assets were checked in RC7, and no blocking issue is currently known.
