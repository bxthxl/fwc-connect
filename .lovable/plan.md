
# Multi-Feature Implementation Plan

This plan covers 8 feature areas: background watermark, events page, manual BGV selection, admin password reset, admin delete users, branch selection, church roles, and prompting existing users for new info.

---

## 1. Background Watermark on Pages

Add the uploaded FWC hand/worship logo as a low-opacity background watermark on all dashboard pages.

**Changes:**
- Copy `user-uploads://WhatsApp_Image_2026-02-16_at_9.16.53_AM.jpeg` to `src/assets/fwc-watermark.png`
- Update `DashboardLayout.tsx` to render the image as a fixed/absolute background element behind the main content area with ~5-8% opacity
- The watermark will be centered and cover the content area subtly

---

## 2. Events Page (New Feature)

Create a new "Events" system separate from meetings, where admins can set up upcoming events with details like dress code and assigned backup vocalists.

**Database:**
- New `events` table with columns: `id`, `title`, `description`, `event_date`, `start_time`, `end_time`, `location`, `dress_code`, `created_by`, `created_at`, `updated_at`
- New `event_bgvs` junction table: `id`, `event_id`, `member_id` (links selected BGVs to an event)
- RLS: All authenticated users can read events; admins can create/update/delete

**Frontend:**
- New `src/pages/EventsPage.tsx` -- Member-facing page showing upcoming events with dress code and BGV list
- New `src/pages/admin/EventsManagementPage.tsx` -- Admin page to create/edit/delete events, assign dress code, and pick BGVs (integrating BGV selector)
- New hooks: `useEvents.ts`
- Add routes in `App.tsx` and nav items in `DashboardLayout.tsx`

---

## 3. BGV Selector - Manual Picking Mode

Upgrade the existing BGV Selector to support both random and manual selection modes.

**Changes to `BGVSelectorPage.tsx`:**
- Add a toggle/tab between "Random" and "Manual" selection modes
- In "Manual" mode, display a searchable, filterable list of members with checkboxes
- Admins can check/uncheck individual members to build the BGV list
- The results card at the bottom works the same for both modes
- This also integrates with the Events page (admin can pick BGVs when creating events)

---

## 4. Admin Password Reset for Users

Allow admins to trigger a password reset email for any user from the Members page, and ensure users can also reset their own passwords (already partially implemented).

**Changes:**
- Add a "Reset Password" button in `MemberDetailsSheet.tsx` (visible to admins only)
- Create an edge function `admin-reset-password` that uses the service role key to call `supabase.auth.admin.generateLink()` or send a reset email for the given user's email
- The existing user-facing "Forgot Password" flow already works but the redirect URL points to `/auth` instead of a dedicated `/reset-password` page
- Create a new `ResetPasswordPage.tsx` at `/reset-password` that detects the recovery token and lets users set a new password
- Update the `redirectTo` in `EmailPasswordAuthForm.tsx` to point to `/reset-password`

---

## 5. Admin Delete Users

Allow admins to delete member profiles (and optionally their auth accounts).

**Changes:**
- Add a "Delete Member" button with confirmation dialog in `MemberDetailsSheet.tsx`
- Create an edge function `admin-delete-user` that:
  1. Deletes the user's profile from `profiles` table
  2. Deletes the user from `auth.users` using the admin API (service role)
- The existing RLS policy already allows admins to delete profiles

---

## 6. Branch Selection (Multi-Branch Support)

Allow users to select which FWC branch they belong to. Data (meetings, events, announcements, etc.) is scoped to the user's branch.

**Database:**
- New `branches` table: `id`, `name`, `address`, `pastor_name`, `pastor_phone`, `created_at`
- Seed all ~130 branches from the document into this table
- Add `branch_id` column (nullable, UUID, FK to branches) to `profiles` table
- Add `branch_id` column to `meetings`, `events`, `announcements`, `songs`, `weekly_songs` tables
- Update RLS policies on these tables to filter by the user's branch (using a helper function `get_user_branch_id(auth_uid)`)

**Frontend:**
- Add branch selection to the OnboardingForm (Step 1 or as a new step)
- Add branch selection to ProfileEditForm
- Update data-fetching hooks to include `branch_id` filter based on the logged-in user's branch
- Admin can see all branches or filter by branch
- Add a "Branch" display in the profile view and member details sheet

---

## 7. Church Roles (Ministry Roles)

Add ministry/church roles that members select during registration. These are descriptive labels (not permission-based like admin/attendance_taker).

**Database:**
- New `church_roles` table: `id`, `name`, `created_at` (seeded with: Protectionist, Worship Leader, Wardrobe Team, EDC Team, Music Development, Team Secretariat, Pastor, Deacon, Branch Lead, Prayer Team)
- New `member_church_roles` junction table: `id`, `profile_id` (FK to profiles), `church_role_id` (FK to church_roles), `created_at`
- RLS: Authenticated users can read all; users can manage their own; admins can manage any

**Frontend:**
- Add church role multi-select to the OnboardingForm (Step 2, alongside voice group)
- Display church roles on profile view, member details sheet, and member cards
- Admins can add/edit church roles for any member
- Add an admin settings page to manage the list of available church roles

---

## 8. Prompt Existing Users for New Required Info

When new required fields are added (branch, church roles), existing users who haven't filled them in should be prompted on their next login.

**Changes:**
- Update `AuthContext` to check if the profile is missing required fields (`branch_id`, church roles)
- Create a `ProfileCompletionDialog` component that appears when a logged-in user has missing required data
- This dialog shows only the missing fields (branch selector, church role picker) and saves them
- Shown once per session until the user completes the fields; blocks access to the dashboard until filled

---

## Technical Details

### Database Migrations (in order)

1. Create `branches` table and seed ~130 branches
2. Create `church_roles` table and seed initial roles
3. Create `member_church_roles` junction table with RLS
4. Add `branch_id` to `profiles` (nullable, FK to branches)
5. Add `branch_id` to `meetings`, `announcements`, `events` tables
6. Create `events` and `event_bgvs` tables with RLS
7. Create helper function `get_user_branch_id(auth_uid)`
8. Update RLS policies to scope data by branch

### New Edge Functions

| Function | Purpose |
|----------|---------|
| `admin-reset-password` | Send password reset email for a user (admin only) |
| `admin-delete-user` | Delete a user's auth account and profile (admin only) |

### New Pages and Routes

| Route | Page | Access |
|-------|------|--------|
| `/events` | EventsPage | All members |
| `/admin/events` | EventsManagementPage | Admin |
| `/reset-password` | ResetPasswordPage | Public |

### Modified Files Summary

| File | Changes |
|------|---------|
| `src/components/layout/DashboardLayout.tsx` | Add watermark background, new nav items (Events) |
| `src/pages/admin/BGVSelectorPage.tsx` | Add manual selection mode with checkboxes |
| `src/components/admin/MemberDetailsSheet.tsx` | Add reset password button, delete member button |
| `src/components/auth/OnboardingForm.tsx` | Add branch selector and church role multi-select |
| `src/components/auth/EmailPasswordAuthForm.tsx` | Fix reset redirect URL |
| `src/pages/AuthPage.tsx` | Handle recovery token redirect |
| `src/types/database.ts` | Add new types (Event, Branch, ChurchRole, etc.) |
| `src/contexts/AuthContext.tsx` | Check for incomplete profile fields |
| `src/App.tsx` | Add new routes |
| `src/components/profile/ProfileView.tsx` | Show branch and church roles |
| `src/components/profile/ProfileEditForm.tsx` | Add branch and church role editing |

### New Files

| File | Purpose |
|------|---------|
| `src/assets/fwc-watermark.png` | Watermark image |
| `src/pages/EventsPage.tsx` | Member-facing events list |
| `src/pages/admin/EventsManagementPage.tsx` | Admin event management |
| `src/pages/ResetPasswordPage.tsx` | Password reset form |
| `src/hooks/useEvents.ts` | Events data hooks |
| `src/hooks/useBranches.ts` | Branch data hooks |
| `src/hooks/useChurchRoles.ts` | Church role hooks |
| `src/components/common/ProfileCompletionDialog.tsx` | Prompt for missing fields |
| `src/components/events/EventCard.tsx` | Event display card |
| `src/components/events/EventForm.tsx` | Admin event creation form |
| `supabase/functions/admin-reset-password/index.ts` | Admin password reset |
| `supabase/functions/admin-delete-user/index.ts` | Admin user deletion |
