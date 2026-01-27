

# Fix: Allow Users to Read Their Own Roles

## The Problem

The `user_roles` table has an RLS policy that **only allows admins to read roles**:

```sql
Policy: "Admins can read all roles"
Command: SELECT
Using: is_admin(auth.uid())
```

This creates a catch-22:
- When **bless john** logs in, the app tries to fetch their roles from `user_roles`
- But bless is NOT an admin, so RLS blocks the SELECT query
- The frontend receives an empty roles array
- Therefore `canTakeAttendance` and `canManageMinutes` are both `false`
- bless cannot see or access the attendance/minutes features

**Bethel (admin)** can read roles and see the admin features, but **bless** cannot see their own roles even though they exist in the database.

## The Solution

Add a new RLS policy that allows authenticated users to read **their own roles**:

```sql
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
USING (user_id = public.get_profile_id(auth.uid()));
```

This uses the existing `get_profile_id` function to match the user's `auth.uid()` to their profile ID, allowing them to read only their own role records.

---

## Technical Changes

### Database Migration (1 policy to add)

| Table | Policy Name | Command | Purpose |
|-------|-------------|---------|---------|
| `user_roles` | "Users can read own roles" | SELECT | Allow users to fetch their own roles on login |

### SQL to Execute

```sql
-- Allow users to read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
USING (user_id = public.get_profile_id(auth.uid()));
```

### No Code Changes Required

The frontend code in `AuthContext.tsx` is already correct - it queries `user_roles` filtered by the user's profile ID. The only issue is the missing RLS policy.

---

## After the Fix

| User | Roles in DB | Can Read Own Roles | Features Visible |
|------|-------------|-------------------|------------------|
| George-Nwaeke Bethel | admin | Yes (admin policy) | All admin features |
| bless john | minutes_taker, attendance_taker | Yes (new policy) | Minutes + Attendance management |

When bless logs in after this fix:
1. `fetchRoles()` queries `user_roles` with `user_id = bless's profile ID`
2. New RLS policy allows the query (matching own roles)
3. Returns `['minutes_taker', 'attendance_taker']`
4. `canTakeAttendance = true`, `canManageMinutes = true`
5. Management navigation links appear in sidebar
6. bless can access `/admin/attendance` and `/admin/minutes`

