

# Make Church Roles Optional

Church roles are currently required in two places. This change makes them optional so plain choir members can skip them.

## Changes

### 1. Onboarding Form (`src/components/auth/OnboardingForm.tsx`)
- Remove the validation check on lines 85-88 that blocks submission when no church roles are selected
- Update the Step 3 label from "Church Roles *" to "Church Roles (Optional)"
- Update the helper text to say "Select any roles that apply, or skip if you're just a choir member."
- Allow the form to submit with zero church roles selected

### 2. Profile Completion Dialog (`src/components/common/ProfileCompletionDialog.tsx`)
- Remove `needsChurchRoles` from the logic entirely -- existing users should NOT be prompted for church roles since they're optional
- Remove the church roles section from the dialog (lines 105-121)
- Remove the validation on lines 45-48 that blocks saving without church roles
- The dialog will now only appear if the user is missing their branch selection

### 3. Minor Cleanup
- Remove unused `useChurchRoles` / `useMemberChurchRoles` imports from `ProfileCompletionDialog.tsx` if church roles section is fully removed from it

