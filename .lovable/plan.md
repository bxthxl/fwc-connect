
# Develop Wuye Settings Page (Branch Info Dashboard)

Transform the placeholder Wuye Settings page into a functional admin page that displays the branch's details and member stats.

## What You'll See

The page will show:
- **Branch Info Card**: Name, address, pastor name, and pastor phone for FWC Wuye
- **Members Card**: Count of members registered to the Wuye branch, with a link to the Members page (filtered)
- **Quick Stats**: Number of upcoming meetings/events for the branch

## Technical Details

### Changes to `src/pages/admin/WuyeSettingsPage.tsx`
- Fetch the Wuye branch record from `branches` table (by name or the admin's own `branch_id` from their profile)
- Display branch details (address, pastor name, pastor phone) in a read-only info card
- Show member count for the branch (query `profiles` where `branch_id` matches)
- Allow admin to edit branch details (address, pastor name, pastor phone) inline with a save button
- Add a card showing upcoming meetings/events count for the branch

### Data Fetching
- Use existing `useBranches` hook to get branch info
- Use `useAuth` to get the admin's `branch_id` from their profile
- Add a small query in the component (or a new hook) to count members in the branch
- Use existing `useMeetings` and `useEvents` hooks for upcoming counts

### Layout
- Header with branch name and MapPin icon (existing)
- Two-column grid on desktop:
  - Left: Branch details card (editable fields for address, pastor name, phone)
  - Right: Stats cards (member count, upcoming meetings, upcoming events)
- Save button to update branch info via `supabase.from('branches').update(...)`
