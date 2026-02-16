

# Add Optional Church Roles to Profile Completion Dialog

When existing users are prompted to complete their profile (currently only for branch selection), add an optional church roles picker so they can choose roles if they want -- or simply skip and continue.

## Changes

### ProfileCompletionDialog (`src/components/common/ProfileCompletionDialog.tsx`)
- Import `useChurchRoles` and `useSetMemberChurchRoles` hooks, plus the `Checkbox` component
- Add state for `selectedChurchRoles` (string array, defaults to empty)
- After the branch selector, add a "Church Roles (Optional)" section with checkboxes listing all available roles
- The save button works regardless of whether any roles are selected -- branch is still required, roles are not
- On save, if any roles were selected, call `setMemberChurchRoles` after updating the branch

### Technical Detail
- No database or schema changes needed -- the `member_church_roles` table and hooks already exist
- The `useSetMemberChurchRoles` hook handles inserting the selected role associations
- The dialog remains blocking (no dismiss) until at least the branch is selected, but church roles can be left empty

