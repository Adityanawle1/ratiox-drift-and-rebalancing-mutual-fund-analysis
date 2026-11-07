# Feature: Add Holding Modal

## Trigger
"Add Holdings" button on Dashboard (empty state) and a persistent "+ Add" button in the Holdings section header.

## Component
`src/components/AddHoldingModal.tsx`

## Dialog
Use `Dialog` from `src/components/ui/dialog.tsx`.

## Fields
| Field | Type | Notes |
|---|---|---|
| Symbol | text input | Required. Uppercase on blur. |
| Name | text input | Optional. Display name for the holding. |
| Asset Class | dropdown | Options pulled from user's `asset_targets` for the active portfolio. |
| Instrument Type | select | Options: `equity`, `mf`, `etf`, `gold`, `reit`, `debt` |
| Quantity | number input | Required. Must be > 0. |
| Avg Buy Price | number input | Required. Must be > 0. |

## On Submit
1. Call `addHolding()` from `src/api/portfolio.ts` with all field values + `portfolio_id` + `user_id`.
2. Call `addTransaction()` with `transaction_type: 'buy'`, same `quantity` and `price` as `avg_buy_price`.
3. On success:
   - Close modal.
   - Refresh holdings list on Dashboard (via callback prop `onSuccess`).
   - Show success toast: "Holding added successfully."
4. On error: show inline error message below the form.

## Props
```ts
interface AddHoldingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  userId: string;
  assetClasses: string[]; // from asset_targets
  onSuccess: () => void;
}
```

## Styling
- Match DriftWatch dark theme (`bg-card`, `border-surface-border`, `text-foreground`, `font-body`).
- Submit button: `bg-amber text-background`.
- Input focus ring: `focus:ring-amber`.
- Error text: `text-drift-red text-xs`.
