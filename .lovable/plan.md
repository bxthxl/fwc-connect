

# FWC Worship Team Platform -- Remaining EPICs Implementation Plan

## Status Assessment

Before diving in, here's what's already complete vs. what still needs to be built:

| EPIC | Status | Notes |
|------|--------|-------|
| 1.1 Profile Picture Upload | DONE | Avatar upload, display in header/cards, storage bucket configured |
| 3.1 Song of the Week | DONE | Weekly song assignments, admin CRUD, member viewing |
| 3.2 Song Bank | DONE | Centralized songs table, searchable, categorized |
| 5.1 Birthday Highlights | PARTIALLY DONE | Today's + upcoming birthdays shown on dashboard; needs monthly view page + admin download |
| 6.2 Notification System | DONE | In-app notifications for announcements & weekly songs, mark read, bell icon |
| 2.1 Onboarding Guide | TO BUILD | Welcome message + app guide for new users |
| 4.1 Multi-Branch Attendance | DEFERRED | Keeping single-branch (Wuye) for now, no schema changes needed |
| 6.1 Worship Team Chat | TO BUILD | Discussion board style |
| 7.1 Random BGV Selection | TO BUILD | Admin tool for random backup vocalist picks |
| 8.1 Wuye Admin Features | TO BUILD | Admin-only section (placeholder for future branch-specific features) |
| 9.1 Branding Update | TO BUILD | Text updates across the app |

---

## Phase 1: Branding Update (EPIC 9.1)

Quick wins across the app to ensure consistent branding.

**Changes:**
- Update `LandingPage.tsx` hero text to "FWC Worship Team Platform"
- Ensure "FWC Worship Team" branding is consistent on login page, dashboard welcome, and notification content
- Update footer copyright text

**Files to modify:** `src/pages/LandingPage.tsx`, `src/pages/AuthPage.tsx` (if needed)

---

## Phase 2: Birthday Enhancements (EPIC 5.1 Completion)

Complete the birthday feature with a full monthly view page.

**New page:** `/birthdays` -- Dedicated birthday page with:
- Monthly tab view showing all members with birthdays in each month
- Current month highlighted by default
- Admin download button to export monthly birthday list as CSV
- Accessible from the dashboard birthday widget via a "View All" link

**Files to create:**
- `src/pages/BirthdaysPage.tsx`

**Files to modify:**
- `src/App.tsx` -- Add `/birthdays` route
- `src/components/layout/DashboardLayout.tsx` -- Add "Birthdays" nav item
- `src/components/dashboard/BirthdayWidget.tsx` -- Add "View All" link

---

## Phase 3: Onboarding Guide (EPIC 2.1)

Introduce a welcome experience for new and existing users.

### Database Changes
- Create `onboarding_content` table:
  - `id` (uuid, PK)
  - `key` (text, unique) -- e.g., `'welcome_message'`, `'guide_step_1'`, etc.
  - `title` (text)
  - `body` (text)
  - `sort_order` (integer)
  - `is_active` (boolean, default true)
  - `updated_by` (uuid, nullable)
  - `created_at`, `updated_at` (timestamps)
- RLS: All authenticated users can read; only admins can insert/update/delete
- Seed initial content rows for the welcome message and key guide steps

### New Components
- `src/components/onboarding/WelcomeDialog.tsx` -- Modal shown on first login with welcome message and guided walkthrough of app sections (Home, Meetings, Songs, Minutes, Profile)
- `src/components/onboarding/OnboardingStep.tsx` -- Individual step card within the guide

### New Admin Page
- `src/pages/admin/OnboardingSettingsPage.tsx` -- Admin page to edit welcome message content and guide steps

### User Tracking
- Add `has_seen_onboarding` (boolean, default false) column to `profiles` table
- On first login, show the welcome dialog; mark as seen afterward
- Add a "Help / App Guide" option in the sidebar or user menu to re-open the guide

**Files to create:**
- `src/components/onboarding/WelcomeDialog.tsx`
- `src/components/onboarding/OnboardingStep.tsx`
- `src/hooks/useOnboarding.ts`
- `src/pages/admin/OnboardingSettingsPage.tsx`

**Files to modify:**
- `src/pages/DashboardPage.tsx` -- Trigger welcome dialog for new users
- `src/types/database.ts` -- Add new types
- `src/App.tsx` -- Add admin route
- `src/components/layout/DashboardLayout.tsx` -- Add admin nav item + Help menu entry

---

## Phase 4: Discussion Board (EPIC 6.1)

A simple forum-style discussion board for worship team communication.

### Database Changes
- Create `discussion_topics` table:
  - `id` (uuid, PK)
  - `title` (text)
  - `body` (text)
  - `created_by` (uuid, references profiles)
  - `is_pinned` (boolean, default false)
  - `is_locked` (boolean, default false)
  - `created_at`, `updated_at` (timestamps)
- Create `discussion_replies` table:
  - `id` (uuid, PK)
  - `topic_id` (uuid, references discussion_topics, cascade delete)
  - `body` (text)
  - `created_by` (uuid, references profiles)
  - `created_at`, `updated_at` (timestamps)
- RLS policies:
  - All authenticated users can read topics and replies
  - Authenticated users can create topics and replies
  - Users can update/delete their own posts
  - Admins can update/delete any post (for moderation: pin, lock, delete)

### New Pages and Components
- `src/pages/DiscussionsPage.tsx` -- List of discussion topics with pinned topics at top
- `src/components/discussions/TopicCard.tsx` -- Topic preview card with reply count
- `src/components/discussions/TopicDetailDialog.tsx` -- Full topic view with replies thread
- `src/components/discussions/NewTopicForm.tsx` -- Form to create a new topic
- `src/components/discussions/ReplyForm.tsx` -- Form to post a reply
- `src/hooks/useDiscussions.ts` -- Hooks for CRUD operations on topics and replies

**Files to modify:**
- `src/App.tsx` -- Add `/discussions` route
- `src/components/layout/DashboardLayout.tsx` -- Add "Discussions" nav item with MessageSquare icon

---

## Phase 5: Random BGV Selection Tool (EPIC 7.1)

Admin-only tool for randomly selecting backup vocalists.

### New Page and Components
- `src/pages/admin/BGVSelectorPage.tsx` -- Admin page with:
  - Filter controls: voice group checkboxes (soprano, alto, tenor, bass)
  - Number of BGVs to select (input)
  - "Generate" button that randomly picks members from the filtered list
  - Display selected members with their voice group badges and avatar
  - "Regenerate" button to re-roll the selection
  - Results are display-only (no persistence needed initially)

No database changes needed -- this uses the existing `profiles` and `useMembers` hook to pull from the member list.

**Files to create:**
- `src/pages/admin/BGVSelectorPage.tsx`
- `src/components/admin/BGVResultCard.tsx`

**Files to modify:**
- `src/App.tsx` -- Add `/admin/bgv-selector` route
- `src/components/layout/DashboardLayout.tsx` -- Add "BGV Selector" admin nav item

---

## Phase 6: Wuye Admin Features Placeholder (EPIC 8.1)

Since branching is deferred, this phase adds an architectural placeholder.

- Add a "Wuye Settings" entry under the admin navigation (visible only to admins)
- Create a placeholder page explaining that branch-specific features are coming soon
- This sets the foundation for future multi-branch support without changing the existing schema

**Files to create:**
- `src/pages/admin/WuyeSettingsPage.tsx`

**Files to modify:**
- `src/App.tsx` -- Add route
- `src/components/layout/DashboardLayout.tsx` -- Add nav item

---

## Technical Details

### Database Migration Summary

One migration will be created covering:

1. **`profiles` table alteration:**
   - Add `has_seen_onboarding boolean NOT NULL DEFAULT false`

2. **`onboarding_content` table (new):**

```text
onboarding_content
+--------------+-------------+----------+-----------+
| Column       | Type        | Nullable | Default   |
+--------------+-------------+----------+-----------+
| id           | uuid (PK)   | No       | random    |
| key          | text UNIQUE | No       | --        |
| title        | text        | No       | --        |
| body         | text        | No       | --        |
| sort_order   | integer     | No       | 0         |
| is_active    | boolean     | No       | true      |
| updated_by   | uuid        | Yes      | --        |
| created_at   | timestamptz | No       | now()     |
| updated_at   | timestamptz | No       | now()     |
+--------------+-------------+----------+-----------+
```

3. **`discussion_topics` table (new):**

```text
discussion_topics
+--------------+-------------+----------+-----------+
| Column       | Type        | Nullable | Default   |
+--------------+-------------+----------+-----------+
| id           | uuid (PK)   | No       | random    |
| title        | text        | No       | --        |
| body         | text        | No       | --        |
| created_by   | uuid        | No       | --        |
| is_pinned    | boolean     | No       | false     |
| is_locked    | boolean     | No       | false     |
| created_at   | timestamptz | No       | now()     |
| updated_at   | timestamptz | No       | now()     |
+--------------+-------------+----------+-----------+
```

4. **`discussion_replies` table (new):**

```text
discussion_replies
+--------------+-------------+----------+-----------+
| Column       | Type        | Nullable | Default   |
+--------------+-------------+----------+-----------+
| id           | uuid (PK)   | No       | random    |
| topic_id     | uuid (FK)   | No       | --        |
| body         | text        | No       | --        |
| created_by   | uuid        | No       | --        |
| created_at   | timestamptz | No       | now()     |
| updated_at   | timestamptz | No       | now()     |
+--------------+-------------+----------+-----------+
```

### RLS Policy Summary
- `onboarding_content`: Authenticated SELECT; Admin INSERT/UPDATE/DELETE
- `discussion_topics`: Authenticated SELECT/INSERT; owner or admin UPDATE/DELETE
- `discussion_replies`: Authenticated SELECT/INSERT; owner or admin UPDATE/DELETE

### New Routes Summary

| Route | Component | Access |
|-------|-----------|--------|
| `/birthdays` | BirthdaysPage | All members |
| `/discussions` | DiscussionsPage | All members |
| `/admin/onboarding` | OnboardingSettingsPage | Admin only |
| `/admin/bgv-selector` | BGVSelectorPage | Admin only |
| `/admin/wuye-settings` | WuyeSettingsPage | Admin only |

### New Navigation Items

**Member sidebar:**
- Birthdays (Cake icon)
- Discussions (MessageSquare icon)

**Admin sidebar:**
- Onboarding Settings
- BGV Selector
- Wuye Settings

### File Count Estimate
- ~12 new files to create
- ~6 existing files to modify
- 1 database migration

