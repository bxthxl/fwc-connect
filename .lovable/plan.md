

# Fix Plan: Sign-Up Redirect, Onboarding Bug, and Birthday Notifications

## Summary of Issues

1. **"Join the Team" button goes to sign-in instead of sign-up** -- Both landing page buttons link to `/auth` which defaults to the sign-in form.
2. **App Guide dialog pops up every visit** -- The `has_seen_onboarding` flag is updated in the database but the in-memory profile state in AuthContext is never refreshed, so the dialog keeps appearing until the user fully logs out and back in.
3. **No birthday notifications exist** -- Currently, birthdays are only shown passively on the dashboard widget and Birthdays page. There is no notification triggered for birthdays. Adding this requires a new notification type and a daily check mechanism.

---

## Fix 1: "Join the Team" Redirects to Sign-Up

**Problem:** Both "Sign In" and "Join the Team" buttons link to `/auth`, which defaults to the sign-in form.

**Solution:** Pass a query parameter `?mode=signup` and have the auth form read it to set the initial form mode.

**Changes:**
- `src/pages/LandingPage.tsx` -- Change "Join the Team" link from `/auth` to `/auth?mode=signup`
- `src/components/auth/EmailPasswordAuthForm.tsx` -- Accept an optional `initialMode` prop and use it to set the default form mode
- `src/pages/AuthPage.tsx` -- Read the `mode` query parameter from the URL and pass it to `EmailPasswordAuthForm`

---

## Fix 2: App Guide Only Shows Once for New Users

**Problem:** When the user finishes or skips the onboarding tour, `markSeen.mutate()` updates the database (`has_seen_onboarding = true`), but the profile object stored in AuthContext's `useState` is never refreshed. On every render, `!(profile as any).has_seen_onboarding` evaluates based on stale state, causing the dialog to reappear.

**Solution (two parts):**

1. **Update the `Profile` TypeScript type** to include `has_seen_onboarding: boolean` so we don't need unsafe `as any` casts.

2. **Call `refreshProfile()` after marking onboarding as seen** so the AuthContext state updates immediately. The `WelcomeDialog` will receive `refreshProfile` as a callback, and after `markSeen.mutate()` succeeds, it will call `refreshProfile()` to update the in-memory profile.

**Changes:**
- `src/types/database.ts` -- Add `has_seen_onboarding: boolean` to the `Profile` interface
- `src/hooks/useOnboarding.ts` -- Accept and call a `refreshProfile` callback in `useMarkOnboardingSeen`, remove the `as any` cast
- `src/components/onboarding/WelcomeDialog.tsx` -- Pass `refreshProfile` from AuthContext to the mark-seen hook
- `src/pages/DashboardPage.tsx` -- Remove the `as any` cast, use typed access to `profile.has_seen_onboarding`

---

## Fix 3: Birthday Notifications (New Feature)

**Current state:** Birthdays are displayed on the dashboard widget and the Birthdays page, but no notifications are sent. The notification system only supports `announcement` and `weekly_song` types.

**Solution:** Add a `birthday` notification type and a database function that generates birthday notifications. Since there is no built-in cron/scheduler in the current setup, the approach will be a database function that can be called daily (via an edge function on a cron schedule) to check for today's birthdays and notify all members.

### Database Changes
- Add `'birthday'` to the `notification_type` enum
- Create a function `notify_birthdays()` that:
  - Finds all profiles whose birthday month and day match today
  - Inserts a notification for every other member (e.g., "Today is [Name]'s birthday!")
  - Uses an idempotency check to avoid duplicate notifications on the same day

### Edge Function (Cron)
- Create a `check-birthdays` edge function that calls the `notify_birthdays()` database function
- This function will be invoked daily (can be called manually or set up with an external cron trigger)

### Changes Summary
- **Database migration:** Add `birthday` to `notification_type` enum, create `notify_birthdays()` function
- **New edge function:** `supabase/functions/check-birthdays/index.ts`
- **NotificationBell component:** No changes needed -- it already renders all notification types generically

---

## Technical Details

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/LandingPage.tsx` | Modify | Change "Join the Team" link to `/auth?mode=signup` |
| `src/pages/AuthPage.tsx` | Modify | Read `mode` query param, pass `initialMode` to auth form |
| `src/components/auth/EmailPasswordAuthForm.tsx` | Modify | Accept `initialMode` prop, use it for default mode state |
| `src/types/database.ts` | Modify | Add `has_seen_onboarding` to `Profile` interface |
| `src/hooks/useOnboarding.ts` | Modify | Accept `refreshProfile` callback, remove `as any` cast |
| `src/components/onboarding/WelcomeDialog.tsx` | Modify | Pass `refreshProfile` to mark-seen hook |
| `src/pages/DashboardPage.tsx` | Modify | Remove `as any` cast |
| `supabase/functions/check-birthdays/index.ts` | Create | Edge function to trigger daily birthday notifications |
| Database migration | Create | Add `birthday` enum value and `notify_birthdays()` function |

### Birthday Notification Flow

```text
Daily Trigger (Edge Function)
       |
       v
  call notify_birthdays()
       |
       v
  Find profiles where birth month/day = today
       |
       v
  For each birthday person:
    Insert notification for ALL other members
    Title: "Happy Birthday [Name]!"
       |
       v
  Members see birthday notifications in the bell icon
```

