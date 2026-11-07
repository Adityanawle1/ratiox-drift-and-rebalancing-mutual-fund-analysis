# Feature: Rebalance Modal

## Trigger
"Rebalance Now" button on the Dashboard drift table header.

## Component
`src/components/RebalanceModal.tsx`

## Dialog
Use `Dialog` from `src/components/ui/dialog.tsx`.

## Layout

### Top Section — Health Score Comparison
Two numbers side by side:
- Before: `healthScoreBefore` (from `analyzeRebalance()`)
- After: `healthScoreAfter` (always 100 after full rebalance)
- Label each clearly: "Before" / "After"
- Color: amber for before, drift-green for after

### Optional Inflow Input
- Label: "New inflow amount (₹)"
- Number input, optional (default 0)
- Passed as `newInflowINR` to `analyzeRebalance()`
- Re-runs analysis on change (debounced or on blur)

### Trades List
Each trade row shows:
- Asset class name
- Action badge: "BUY" (drift-green) or "SELL" (drift-red)
- Amount: `₹{amountINR.toLocaleString('en-IN')}`
- Reason text: muted, smaller font

Empty state: "Portfolio is balanced. No trades needed."

## Buttons
| Button | Action |
|---|---|
| Execute Rebalance | Call `saveRebalanceEvent()` with `status: 'executed'`, then call `onSuccess()` to refresh dashboard, close modal |
| Dismiss | Call `saveRebalanceEvent()` with `status: 'dismissed'`, close modal |

## Props
```ts
interface RebalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  userId: string;
  holdings: HoldingWithValue[];
  targets: AssetClass[];
  onSuccess: () => void;
}
```

## Data Flow
```ts
const result = analyzeRebalance(holdings, targets, newInflowINR);
// result.trades, result.healthScoreBefore, result.healthScoreAfter, result.totalPortfolioValue
```

## Styling
- Match DriftWatch dark theme.
- BUY badge: `bg-drift-green/10 text-drift-green`
- SELL badge: `bg-drift-red/10 text-drift-red`
- Divider between trades: `border-surface-border`
