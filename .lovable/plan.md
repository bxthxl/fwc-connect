

# Admin Direct Password Reset

Instead of relying on email reset links (which point to the Lovable preview URL and don't work reliably), add the ability for admins to set a new password directly for any member.

## What Changes

### 1. New Edge Function: `admin-set-password`
- Accepts a user ID and a new password from an authenticated admin
- Uses the service role to call `auth.admin.updateUserById()` to set the password directly
- Validates that the caller is an admin before proceeding
- No email link needed -- the admin tells the member their new temporary password

### 2. Updated Member Details Sheet (`src/components/admin/MemberDetailsSheet.tsx`)
- Replace the current "Reset Password" button (which sends an unreliable email) with a "Set New Password" dialog
- The dialog has a password input field where the admin types a temporary password
- On submit, it calls the new edge function to set the password immediately
- Admin can then tell the member their new password directly (in person, phone, etc.)

### 3. Edge Function Config
- Add `admin-set-password` to `supabase/config.toml` with `verify_jwt = false` (JWT validated in code)

## How It Works
1. Admin opens a member's details in the Members page
2. Clicks "Set New Password" under Admin Actions
3. Types a temporary password (minimum 6 characters)
4. Clicks confirm -- password is updated immediately
5. Admin tells the member their new password
6. Member can then change it themselves from their profile page

## Technical Details

### Edge Function (`supabase/functions/admin-set-password/index.ts`)
- Validates admin role via the existing `is_admin` RPC
- Calls `adminClient.auth.admin.updateUserById(userId, { password })` using the service role key
- Returns success/error response with CORS headers

### UI Changes (`MemberDetailsSheet.tsx`)
- Add an `AlertDialog` with a password input field
- Wire it to call the new edge function
- Keep the existing "Reset Password" (email) button as a secondary option, but make the new "Set Password" the primary action
