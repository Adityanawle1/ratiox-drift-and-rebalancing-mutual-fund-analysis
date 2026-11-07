# Feature: Onboarding Wizard

## Trigger
Show when user logs in and `profiles.onboarded === false`.
Check in Dashboard `useEffect` after loading profile. Redirect to `/onboarding` or render wizard overlay.

## Component
`src/pages/Onboarding.tsx`

## Route
`/onboarding` — protected route (requires auth).

## Steps

### Step 1 — Portfolio Name
- Single text input: "Portfolio Name"
- Default value: `"My Portfolio"`
- Required, min 1 character
- "Continue →" button advances to Step 2

### Step 2 — Asset Allocation
Preset asset classes table:

| Asset Class | Default Target % | Default Drift Threshold % |
|---|---|---|
| Large Cap Equity | 30 | 5 |
| Mid Cap Equity | 15 | 5 |
| Small Cap Equity | 10 | 7 |
| Debt Funds | 20 | 5 |
| Gold ETF | 10 | 5 |
| International Equity | 5 | 7 |
| REITs | 5 | 7 |
| Cash | 5 | 10 |

Each row has:
- Asset class name (read-only label)
- Target % input (number, 0–100)
- Drift Threshold % input (number, 1–20)

Validation:
- All target % must sum to exactly 100
- Show running total at bottom: "Total: X% / 100%"
- Show error in `text-drift-red` if total ≠ 100
- "Complete Setup" button disabled until total === 100

## On Complete
1. Create portfolio via `createPortfolio(userId, portfolioName)` if not already created.
2. Call `upsertAssetTargets(portfolioId, targets)` with the filled-in allocations.
3. Call `supabase.from('profiles').update({ onboarded: true }).eq('id', userId)`.
4. Redirect to `/dashboard`.

## Styling
- Full-screen layout, centered card, max-w-2xl
- Step indicator at top: "Step 1 of 2" / "Step 2 of 2"
- Progress bar: thin amber line filling left to right
- Match DriftWatch dark theme throughout
- "Back" button on Step 2 to return to Step 1

## Dashboard Integration
In `Dashboard.tsx` `initDashboard()`:
```ts
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarded')
  .eq('id', user.id)
  .single();

if (!profile?.onboarded) {
  navigate('/onboarding');
  return;
}
```
