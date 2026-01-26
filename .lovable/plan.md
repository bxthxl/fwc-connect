

# Switch to Email Magic Link Authentication

## Overview
Replace phone OTP authentication with email magic link. This is free, doesn't require Twilio, and users will receive a clickable login link in their email.

---

## What Changes

### 1. New Email Authentication Form
Create `EmailAuthForm.tsx` to replace the phone form:
- Email input field with validation
- "Send Magic Link" button
- Success screen after sending (tells user to check email)
- Handles the magic link callback automatically via Supabase

### 2. Database Schema Update
Adjust the profiles table to reflect email-based auth:
- Make `email` column required (NOT NULL) since it's now the login identifier
- Make `phone` column optional (nullable) since it's no longer required for auth
- Remove the UNIQUE constraint from phone (keep UNIQUE on email)

### 3. Update Onboarding Form
- Remove email from the form (it's already captured from auth)
- Add phone number as an optional field during registration
- Pre-fill email from the authenticated user

### 4. Update Auth Context
- Fetch email from `user.email` instead of `user.phone`

### 5. Update Type Definitions
- Adjust the Profile interface to reflect email as required and phone as optional

---

## User Experience Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User enters email address                                │
│                    ↓                                         │
│  2. Clicks "Send Magic Link"                                 │
│                    ↓                                         │
│  3. Sees "Check your email" message                          │
│                    ↓                                         │
│  4. User clicks link in email                                │
│                    ↓                                         │
│  5. Redirected back to app (auto-authenticated)              │
│                    ↓                                         │
│  6. New users → Onboarding form                              │
│     Existing users → Dashboard                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/auth/EmailAuthForm.tsx` | New magic link authentication form |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/AuthPage.tsx` | Use `EmailAuthForm` instead of `PhoneAuthForm` |
| `src/components/auth/OnboardingForm.tsx` | Email pre-filled, phone now optional input |
| `src/types/database.ts` | Update Profile interface (email required, phone optional) |

### Database Migration
```sql
-- Make email required (NOT NULL) with unique constraint
-- Make phone optional (remove NOT NULL)
ALTER TABLE public.profiles 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;

-- Add unique constraint on email, remove from phone
ALTER TABLE public.profiles DROP CONSTRAINT profiles_phone_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
```

---

## Benefits
- **Free**: No SMS provider costs
- **Simpler**: No OTP code entry required
- **Reliable**: Email delivery is more reliable than SMS
- **Secure**: Magic links expire and are single-use

