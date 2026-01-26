

# Improve Birthday Calendar Selector

## The Problem
The current calendar only lets you navigate one month at a time using arrow buttons. To select a birthday from 30 years ago, you'd need to click the back arrow **360 times** - extremely frustrating!

## The Solution
Add dropdown selectors for **month** and **year** directly in the calendar header. This lets users:
1. Select the year (e.g., 1990) from a dropdown
2. Select the month (e.g., March) from another dropdown
3. Then pick the specific day

This is the standard approach for birthday pickers and makes navigation effortless.

---

## How It Will Look

```text
┌─────────────────────────────────────────┐
│  [March ▼]  [1990 ▼]                    │
├─────────────────────────────────────────┤
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat      │
│   1    2    3    4    5    6    7       │
│   8    9   10   11   12   13   14       │
│  15   16   17   18   19   20   21       │
│  22   23   24   25   26   27   28       │
│  29   30   31                           │
└─────────────────────────────────────────┘
```

Users can quickly jump to any year/month combination, then tap the day.

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/ui/date-picker-with-dropdowns.tsx` | New calendar component with month/year dropdowns |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/auth/OnboardingForm.tsx` | Use the new date picker component for birthday field |

### Implementation Approach
1. Create a new date picker component that wraps react-day-picker with:
   - Year dropdown (1920 to current year)
   - Month dropdown (January - December)
   - Uses `captionLayout="dropdown-buttons"` mode from react-day-picker
   - Proper styling with Select components for consistency

2. Update the birthday field in OnboardingForm to use this enhanced picker

### No Database Changes Required
This is purely a UI improvement.

