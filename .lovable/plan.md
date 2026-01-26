
# Build the Complete FWC Worshippers Application

## Overview
Build out all the remaining pages and functionality for the Family Worship Center Worshippers app. This includes member-facing pages (Profile, Meetings, Minutes) and admin management pages (Members, Meetings, Attendance, Minutes, Announcements).

---

## What Will Be Built

### Member Pages
| Page | Description |
|------|-------------|
| **Profile** | View and edit personal profile information |
| **Meetings** | View list of upcoming and past meetings |
| **Minutes** | Read published meeting minutes |

### Admin Pages
| Page | Description |
|------|-------------|
| **Admin Overview** | Dashboard with key stats and quick actions |
| **Members Management** | View all members, filter by voice group, assign roles |
| **Meetings Management** | Create, edit, delete meetings |
| **Attendance** | Mark attendance for meetings with group filtering |
| **Minutes Management** | Create, edit, publish meeting minutes |
| **Announcements** | Create and manage announcements with visibility dates |

---

## Page Details

### 1. Profile Page (`/profile`)
**Features:**
- Display current profile information in a clean card layout
- Edit mode to update: name, phone, residence, birthday, voice group, instruments, care group info
- Password change section
- Show member since date and voice group badge

### 2. Meetings Page (`/meetings`)
**Features:**
- Tabs for "Upcoming" and "Past" meetings
- Meeting cards showing: title, date, time, location
- Click to view meeting details and attached minutes (if published)
- Empty state when no meetings exist

### 3. Minutes Page (`/minutes`)
**Features:**
- List of published minutes only (per RLS policy)
- Each entry shows meeting title, date, and excerpt
- Click to read full minutes in a rich text viewer
- Search/filter by meeting date

### 4. Admin Overview (`/admin`)
**Features:**
- Quick stats: total members, upcoming meetings, pending minutes
- Recent activity feed
- Quick action buttons: Create Meeting, View Members, etc.

### 5. Members Management (`/admin/members`)
**Features:**
- Table/list of all members with search
- Filter by voice group (Soprano, Alto, Tenor, Bass, Instrumentalist)
- View member details in a slide-out panel
- Assign/remove roles (admin, attendance_taker, minutes_taker)
- Mobile-friendly card view

### 6. Meetings Management (`/admin/meetings`)
**Features:**
- Create new meeting: title, date, time, location, description
- Edit existing meetings
- Delete meetings (with confirmation)
- View attendance summary for past meetings

### 7. Attendance Page (`/admin/attendance`)
**Features:**
- Select meeting from dropdown
- Members grouped by voice section
- One-tap status buttons: Present / Absent / Excused
- "Mark All Present" button per group
- Notes field for excused absences
- Real-time save feedback

### 8. Minutes Management (`/admin/minutes`)
**Features:**
- List of all minutes (draft and published)
- Create/edit with rich text editor
- Publish/unpublish toggle
- Link minutes to specific meeting

### 9. Announcements (`/admin/announcements`)
**Features:**
- Create announcement: title, body, visible from/to dates
- Edit and delete announcements
- Status indicator: Active, Scheduled, Expired

---

## Technical Architecture

### New Files to Create

```text
src/pages/
  ProfilePage.tsx
  MeetingsPage.tsx
  MinutesPage.tsx
  admin/
    AdminOverviewPage.tsx
    MembersPage.tsx
    MeetingsManagementPage.tsx
    AttendancePage.tsx
    MinutesManagementPage.tsx
    AnnouncementsPage.tsx

src/components/
  profile/
    ProfileView.tsx
    ProfileEditForm.tsx
    PasswordChangeForm.tsx
  meetings/
    MeetingCard.tsx
    MeetingDetailsDialog.tsx
  minutes/
    MinutesCard.tsx
    MinutesViewer.tsx
    RichTextEditor.tsx
  admin/
    StatsCard.tsx
    MemberCard.tsx
    MemberDetailsSheet.tsx
    RoleSelector.tsx
    MeetingForm.tsx
    AttendanceMarker.tsx
    VoiceGroupFilter.tsx
    AnnouncementForm.tsx
```

### Routing Updates
Update `App.tsx` to render the correct page component for each route instead of using `DashboardPage` as a placeholder for all routes.

### Data Hooks (using React Query)
Create custom hooks for data fetching:
- `useMeetings()` - fetch meetings with upcoming/past filter
- `useMinutes()` - fetch published minutes
- `useMembers()` - fetch all members (admin only)
- `useAttendance()` - fetch/mutate attendance records
- `useAnnouncements()` - fetch announcements

---

## Implementation Order

1. **Profile Page** - View and edit own profile
2. **Meetings Page** - View meetings list
3. **Minutes Page** - Read published minutes
4. **Admin Overview** - Admin dashboard
5. **Members Management** - View and manage members
6. **Meetings Management** - CRUD for meetings
7. **Attendance Page** - Mark attendance
8. **Minutes Management** - Create and publish minutes
9. **Announcements** - Manage announcements

---

## Database Considerations

The database schema is already complete with all required tables:
- `profiles` - Member information
- `meetings` - Meeting records
- `attendance` - Attendance records
- `minutes` - Meeting minutes
- `announcements` - Announcements
- `user_roles` - Role assignments

RLS policies are already configured for proper access control.

---

## UI/UX Highlights

- **Mobile-first design**: Touch-friendly targets, swipe gestures where appropriate
- **Purple and gold color palette**: Consistent with church/choir aesthetic
- **Voice group badges**: Color-coded for quick identification
- **Loading states**: Skeleton loaders while fetching data
- **Empty states**: Helpful messages when no data exists
- **Toast notifications**: Feedback for all actions
- **Responsive tables**: Card layout on mobile, table on desktop
