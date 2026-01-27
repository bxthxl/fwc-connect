

# Fix Member Dashboard to Display Real Data

## The Problem
The member dashboard (`/dashboard`) is showing **hardcoded static values** instead of fetching actual data from the database:
- "Upcoming Meetings" always shows `0`
- "Published Minutes" always shows `0`  
- "Announcements" always shows `0`
- "Total Members" always shows `1`
- "Next Meeting" card never shows real meeting data

Meanwhile, the Admin Overview page correctly uses data hooks (`useMeetings`, `useMinutes`, `useAnnouncements`) to display live data.

## The Solution
Update `DashboardPage.tsx` to:
1. Import and use the existing data hooks
2. Fetch real counts for meetings, minutes, and announcements
3. Display the actual next upcoming meeting
4. Show active announcements to members
5. Add proper loading states

---

## What Will Change

### Before (Hardcoded)
```text
Upcoming Meetings: 0
Published Minutes: 0
Announcements: 0
Next Meeting: "No upcoming meetings scheduled"
```

### After (Live Data)
```text
Upcoming Meetings: 3  (actual count from database)
Published Minutes: 5  (actual count of published minutes)
Announcements: 1      (count of currently active announcements)
Next Meeting: "Choir Practice - Jan 30, 2026 at 6:00 PM"
```

---

## Technical Details

### File to Modify
| File | Changes |
|------|---------|
| `src/pages/DashboardPage.tsx` | Add data hooks, replace hardcoded values, show next meeting, display active announcements |

### Implementation
1. **Import data hooks**: `useMeetings`, `useMinutes`, `useAnnouncements`
2. **Fetch data**:
   - Upcoming meetings with `useMeetings('upcoming')`
   - Published minutes with `useMinutes()` (already filters to published for non-admin)
   - Active announcements with `useAnnouncements()`
3. **Display real counts** in the stats cards
4. **Show next meeting details**: Title, date, time, location
5. **Show active announcements** section with announcement cards
6. **Add loading spinner** while data is being fetched

### No Database Changes Required
This is purely a frontend fix using existing hooks and data.

