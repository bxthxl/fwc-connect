

# Fix User Deletion (Foreign Key + Auth Issues)

The deletion is failing for two reasons:

1. **Foreign key constraint**: The profile has related records in `notifications`, `member_church_roles`, and potentially other tables. The edge function tries to delete the profile without cleaning up these related records first, causing a database error.

2. **Broken auth check**: The edge function uses `supabase.auth.getClaims()` which isn't a standard Supabase JS v2 method. This likely fails with an "Unauthorized" error before even reaching the deletion logic.

## What Will Change

### Fix the Edge Function (`supabase/functions/admin-delete-user/index.ts`)
- Replace `getClaims()` with `supabase.auth.getUser()` to properly identify the calling admin
- Before deleting the profile, delete all related records from:
  - `notifications` (where `user_id` = profile id)
  - `member_church_roles` (where `profile_id` = profile id)
  - `user_roles` (where `user_id` = profile id)
  - `attendance` (where `user_id` = profile id)
  - `event_bgvs` (where `member_id` = profile id)
  - `discussion_topics` / `discussion_replies` (where `created_by` = profile id)
- Then delete the profile, then delete the auth user

### Technical Detail
- Uses the service role admin client for all deletions (bypasses RLS)
- First looks up the profile `id` from the `auth_user_id`, then cascades through all related tables
- Auth validation switches to `getUser()` which is the standard and reliable method

## Note About Duplicate Profiles
There are actually two profiles for this person in the database:
- "INYANG MICHAE;L ANI" (with a semicolon typo) -- email: inyang.ani@mintnigeria.com
- "INYANG MICHAEL ANI" -- email: ud4ani@gmail.com

You may want to delete the duplicate (the one with the typo) after this fix is deployed.

