# Attendance Pro 📊

> Real-time classroom attendance management for teachers and students.

**Live:** [https://attendanceapprepo.vercel.app](https://attendanceapprepo.vercel.app)

---

## Features

### For Teachers (Admin)
- Open an attendance window for 2 / 3 / 5 / 10 minutes
- Live countdown timer with auto-close
- Real-time list of every student who marked attendance (name, enrollment, branch, semester, time)
- Close the window early at any time

### For Students
- Sign up with name, enrollment number, branch, and semester
- Dashboard shows their personal data
- "Mark Attendance" button activates in real-time the moment teacher opens the window
- Button locks after marking — prevents double submission
- Full attendance history with dates and percentage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Auth + DB | Supabase |
| Real-time | Supabase Realtime |
| Deployment | Vercel |

---

## Local Setup

```bash
git clone https://github.com/shubhika123/attendance_app.git
cd attendance_app
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the SQL schema in Supabase SQL Editor → paste contents of `supabase_setup.sql` → Run.

```bash
npm run dev
```

---

## Database Setup

Run `supabase_setup.sql` in your Supabase SQL Editor. It creates:

- `profiles` — stores user data (name, enrollment, branch, semester, role)
- `attendance_sessions` — teacher-controlled attendance windows
- `attendance_logs` — individual student attendance records
- Row Level Security policies
- Auto-profile trigger on signup
- Real-time enabled on sessions and logs

---

## User Roles

| Role | How to register | Access |
|------|----------------|--------|
| **Student** | Sign up → pick Student → fill details | Dashboard with own data |
| **Teacher** | Sign up → pick Teacher → enter code `DEVOPS2024` | Admin control panel |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Smart redirect (login → dashboard/admin)
│   ├── login/page.tsx        # Login page
│   ├── signup/page.tsx       # 2-step signup (role → details)
│   ├── dashboard/page.tsx    # Student dashboard
│   └── admin/page.tsx        # Teacher admin panel
├── components/
│   ├── Header.tsx
│   ├── ProfileCard.tsx
│   ├── AttendanceProgress.tsx
│   ├── AttendanceButton.tsx
│   ├── AssignmentsList.tsx
│   ├── GradesTable.tsx
│   └── FeedbackSection.tsx
├── context/
│   └── AuthContext.tsx       # Global auth + profile state
├── hooks/
│   └── useAttendanceSession.ts
└── lib/
    └── supabase.ts           # Supabase client
supabase_setup.sql            # Full DB schema
```
