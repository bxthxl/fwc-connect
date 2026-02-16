

# Fix User Deletion -- Handle ALL Foreign Key References

The deletion is still failing because the `songs` table (and several others) reference the profile and don't have CASCADE/SET NULL configured. The current edge function cleans up some related tables but misses others.

## Root Cause

The error is: `songs_created_by_fkey` blocks profile deletion. The edge function needs to handle **all** tables that reference `profiles` without CASCADE or SET NULL.

## Tables That Need Handling

Tables already cleaned up (working):
- `notifications` (CASCADE -- auto-handled, but also manually deleted)
- `member_church_roles` (CASCADE)
- `user_roles` (CASCADE)
- `attendance` (CASCADE for user_id, SET NULL for marked_by)
- `event_bgvs` (CASCADE)
- `discussion_replies` (NO ACTION -- manually deleted)
- `discussion_topics` (NO ACTION -- manually deleted)

Tables **missing** from the cleanup (causing the failure):
- `songs` (created_by -- NO ACTION)
- `weekly_songs` (assigned_by -- NO ACTION)
- `onboarding_content` (updated_by -- NO ACTION)
- `events` (created_by -- NO ACTION)

## What Will Change

### Update Edge Function (`supabase/functions/admin-delete-user/index.ts`)

Add cleanup for the missing tables before deleting the profile. For content tables like songs and events, we'll SET the reference to NULL rather than delete the records (since deleting a member shouldn't remove songs or events they created):

- `songs`: set `created_by` to NULL where it matches the profile id
- `weekly_songs`: set `assigned_by` to NULL where it matches the profile id
- `onboarding_content`: set `updated_by` to NULL where it matches the profile id
- `events`: set `created_by` to NULL where it matches the profile id

This preserves the data (songs, events stay intact) while removing the reference to the deleted member.
