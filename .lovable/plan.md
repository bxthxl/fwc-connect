

# Switch to Email and Password Authentication

## Overview
Replace email magic link authentication with traditional email + password login. Users will create an account with a password and sign in directly without needing to check their email each time.

---

## What Changes

### 1. New Email/Password Authentication Form
Replace `EmailAuthForm.tsx` with a new form that:
- Email input field with validation
- Password input field with show/hide toggle
- Toggle between "Sign In" and "Create Account" modes
- Password confirmation for sign-up
- Password strength indicator (optional, for better UX)
- "Forgot Password" link (for password reset flow)

### 2. Authentication Methods
Use Supabase's built-in methods:
- `signUp()` for new account creation
- `signInWithPassword()` for returning users
- `resetPasswordForEmail()` for password reset

### 3. Password Reset Flow
Add a simple password reset flow:
- User clicks "Forgot Password"
- Enters email to receive reset link
- Clicks link in email to set new password

---

## User Experience Flow

```text
┌─────────────────────────────────────────────────────────────┐
│              New User - Sign Up Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User enters email and password                           │
│                    ↓                                         │
│  2. Clicks "Create Account"                                  │
│                    ↓                                         │
│  3. Account created (auto-confirmed)                         │
│                    ↓                                         │
│  4. Redirected to Onboarding form                            │
│                    ↓                                         │
│  5. Complete profile → Dashboard                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Existing User - Sign In Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User enters email and password                           │
│                    ↓                                         │
│  2. Clicks "Sign In"                                         │
│                    ↓                                         │
│  3. Authenticated immediately                                │
│                    ↓                                         │
│  4. Redirected to Dashboard                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/auth/EmailPasswordAuthForm.tsx` | New email/password authentication form with sign-in/sign-up toggle |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/AuthPage.tsx` | Use `EmailPasswordAuthForm` instead of `EmailAuthForm` |

### Files to Delete
| File | Reason |
|------|--------|
| `src/components/auth/EmailAuthForm.tsx` | No longer needed (replaced by EmailPasswordAuthForm) |

### No Database Changes Required
- The profiles table already has `email` as NOT NULL UNIQUE
- Auto-confirm email is already enabled

---

## Component Design: EmailPasswordAuthForm

The new form will include:

1. **Mode toggle**: "Sign In" / "Create Account" tabs or link
2. **Email field**: With validation
3. **Password field**: With show/hide toggle, minimum 6 characters
4. **Confirm Password**: Only shown in sign-up mode
5. **Submit button**: Dynamic text based on mode
6. **Forgot Password link**: Opens reset password view
7. **Error handling**: Clear error messages for common issues

---

## Benefits
- **Faster login**: No need to check email each time
- **Familiar UX**: Standard login pattern users expect
- **Offline access**: Can sign in without email access
- **More control**: Users manage their own passwords

