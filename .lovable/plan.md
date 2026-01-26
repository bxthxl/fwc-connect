

# Family Worship Center Worshippers (FWC) - Implementation Plan

## Overview
A mobile-first web application for managing your worship team with member registration, attendance tracking, meeting minutes, and announcements. Built with your uploaded logo as the brand identity.

---

## 🎨 Design & Branding
- **Logo**: Your FWC logo prominently displayed on landing page, auth screens, and dashboard header
- **Color scheme**: Calm, warm tones inspired by your logo (soft purples, gold/yellow accents, neutral grays)
- **Typography**: Clean, readable fonts optimized for mobile
- **Components**: Modern shadcn/ui-style cards, badges, and touch-friendly buttons

---

## 📱 Pages & Features

### Public Pages
1. **Landing Page**
   - Hero section with FWC logo and mission statement
   - Feature highlights (attendance, meetings, minutes)
   - Sign In / Sign Up call-to-action buttons

2. **Authentication**
   - Phone number entry screen
   - OTP verification screen
   - New member onboarding form (first-time users)

---

### Member Dashboard
3. **Home**
   - Welcome message with member's name
   - Next upcoming meeting card (prominent)
   - List of upcoming meetings
   - Recent announcements banner
   - Quick links to minutes and profile

4. **Meetings**
   - Upcoming meetings list with date/time/location
   - Past meetings list
   - Meeting detail view with published minutes

5. **Minutes**
   - Searchable list of past meeting minutes
   - Sort by date or title
   - Rich text viewer with nice formatting

6. **Profile**
   - View and edit personal details
   - Display group badge (Soprano, Alto, Tenor, Bass, Instrumentalist)
   - Instrument tags for instrumentalists
   - Care group leader information
   - Non-editable phone number display

---

### Admin Dashboard
7. **Admin Overview**
   - Total members count by group
   - Latest meeting attendance summary
   - Quick action buttons: Create Meeting, Take Attendance, Write Minutes, Post Announcement

8. **Members Management**
   - Searchable/filterable member table
   - Filter by group (voice section)
   - Filter by instrument (for instrumentalists)
   - Member detail page with:
     - Full profile information
     - Attendance history
     - Permission toggles (Admin, Attendance Taker, Minutes Taker)

9. **Meetings Management**
   - Create new meetings (title, date, time, location, description)
   - Edit existing meetings
   - View meeting details with attendance data
   - Export attendance to CSV

10. **Take Attendance**
    - Meeting selector
    - Members grouped by section:
      - Soprano
      - Alto
      - Tenor
      - Bass
      - Instrumentalists (with instrument displayed)
    - One-tap Present / Absent / Excused buttons
    - "Mark all present" per group
    - Save with timestamp and who marked it

11. **Minutes Management**
    - Create/edit minutes per meeting
    - Rich text editor (bold, italic, lists, headings)
    - Auto-save functionality
    - Publish toggle (members see only published minutes)

12. **Announcements**
    - Create announcements with title and body
    - Set visibility dates (from/to)
    - Manage existing announcements

---

## 🔐 Security & Roles

### Role-Based Access Control
- **Admin**: Full access to everything
- **Attendance Taker**: Can take attendance only
- **Minutes Taker**: Can create/edit minutes only
- **Member**: View own profile, meetings, and published minutes

### Security Features
- Roles stored in separate `user_roles` table (security best practice)
- Row-Level Security (RLS) on all tables
- Protected admin routes
- Phone number verification via OTP

---

## 💾 Database Structure

### Tables
1. **profiles** - Member information (name, phone, email, residence, birthday, year joined, group, instruments, care group leader)
2. **user_roles** - Separate table for admin, attendance_taker, minutes_taker roles
3. **meetings** - Meeting details (title, date, time, location, description)
4. **attendance** - Attendance records linked to meetings and users
5. **minutes** - Rich text meeting minutes with publish status
6. **announcements** - Announcements with visibility dates

---

## 📋 Registration Fields

### Basic Information
- Full name (required)
- Phone number (required, unique)
- Email address (optional)
- Residence/Address (required)
- Birthday (required)
- Year joined (required)

### Grouping
- Voice Section: Soprano, Alto, Tenor, Bass, or Instrumentalist
- Care Group Leader Name (required)
- Care Group Leader Phone (required)

### For Instrumentalists
- Primary Instrument (required): Bass guitar, Drum, Keyboards, Saxophones, Violin, Electric guitar, Electric keyboard, Conga drums, Flute, Talking drums
- Secondary Instrument (optional)

---

## 🚀 Technical Implementation

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Lovable Cloud (managed Supabase)
- **Authentication**: Phone OTP via Supabase Auth
- **Rich Text**: React-based rich text editor for minutes
- **Mobile-First**: Responsive design optimized for phone attendance-taking

---

## 📦 Sample Data
- Pre-seeded with sample users across all voice sections and instruments
- Sample meetings (past and upcoming)
- Sample minutes and announcements

