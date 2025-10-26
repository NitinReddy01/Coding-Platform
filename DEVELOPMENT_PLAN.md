# Development Plan - Coding Platform
**Full-Stack Development with Phase-by-Phase Approach**

**Last Updated:** 2025-10-26
**Status:** 🟡 Phase 1 - In Progress (Step 1A - 80% complete)
**Overall Progress:** 25% (0/5 phases completed, Phase 1 Step 1A 80%)

**Recent Updates:**
- ✅ Async submission processing with RabbitMQ implemented
- ✅ Database submissions table migration completed
- ✅ Frontend polling mechanism with useSubmissionPolling hook
- ✅ Mail service integration with SMTP
- ✅ Migrated from http.ServeMux to Chi router

---

## 📋 Table of Contents

1. [Development Workflow](#development-workflow)
2. [Project Overview](#project-overview)
3. [Current State](#current-state)
4. [Phase 1: Core Platform](#phase-1-core-platform)
5. [Phase 2: Admin Panel](#phase-2-admin-panel)
6. [Phase 3: Contest System](#phase-3-contest-system)
7. [Phase 4: Recruitment/Assessment System](#phase-4-recruitmentassessment-system)
8. [Phase 5: Analytics & Polish](#phase-5-analytics--polish)
9. [Design System & Technical Specs](#design-system--technical-specs)
10. [API Endpoints Reference](#api-endpoints-reference)

---

## 🔄 Development Workflow

### Three-Step Approach Per Phase:

Each phase follows this structure for **complete end-to-end functionality**:

```
Phase X
├── Step A: Frontend Implementation (2 weeks)
│   ├── Build UI screens with mock data
│   ├── Create components
│   ├── Set up state management
│   └── Implement routing
│
├── Step B: Backend Implementation (1 week)
│   ├── Create database migrations
│   ├── Build API endpoints
│   ├── Implement business logic
│   └── Add authentication/authorization
│
└── Step C: Integration & Testing (2-3 days)
    ├── Connect frontend to backend APIs
    ├── Replace mock data with real data
    ├── End-to-end testing
    ├── Bug fixes and polish
    └── Phase demo/review
```

### Benefits:
✅ Each phase is **fully working** before moving forward
✅ Can **demo real features** after each phase
✅ **Incremental testing** catches issues early
✅ **Clear milestones** for progress tracking
✅ **Parallel work possible** (if team available)

---

## 🎯 Project Overview

### Dual-Purpose Platform:
1. **Practice Platform** (like LeetCode) - Developers improve problem-solving skills
2. **Recruitment Assessment Tool** - Companies evaluate candidates with customizable contests

### Key Differentiators:
- 🔐 **Role-based UI** (admin/author/user/guest)
- 📊 **Customizable leaderboards** with visibility controls
- 📈 **Comprehensive recruitment reports** with candidate comparison
- ⚡ **Real-time updates** for contests and leaderboards
- ✅ **Problem approval workflow** for content quality

---

## ✅ Current State

### Existing Features:
- ✅ Authentication (Login/Register with Google OAuth)
- ✅ Problem solving page with Monaco editor
- ✅ Code execution worker (Docker-based)
- ✅ **Asynchronous submission processing with RabbitMQ**
- ✅ **Submission status tracking and polling**
- ✅ Database schema: users, roles, problems, tags, test_cases, **submissions**
- ✅ Basic UI components: Button, Card, Tabs, Select, Badge, Input, Label
- ✅ **Advanced UI components: Modal, Dropdown, Avatar, Tooltip, StatusBadge**
- ✅ Redux store with editor slice
- ✅ Protected routes
- ✅ **Chi router for backend routing**
- ✅ **SMTP-based mail service**
- ✅ **Keyboard shortcuts (platform-aware)**

### Existing Database Tables:
- `users`, `authentication`, `roles`, `user_roles`
- `problems`, `tags`, `problem_tags`, `test_cases`
- `refresh_tokens`
- **`submissions`** - Tracks all code submissions with status, metrics, and results

### Existing Pages:
- `/login`, `/register`, `/auth/google/callback`
- `/problems/:id` (ProblemPage with editor)
- Dashboard, Problems List, Submissions History, User Profile (Phase 1A screens)

### Existing API Endpoints:
- `/api/auth/*` - Authentication endpoints
- `/api/problems/*` - Problem CRUD and retrieval
- **`/api/submissions`** - Submit code for execution (returns submission_id)
- **`/api/submissions/status/{id}`** - Poll submission status
- **`/api/submissions/problem/{problemId}/latest`** - Get latest submission
- **`/api/mails/send-mail`** - Send email via SMTP

---

## 📱 PHASE 1: Core Platform
**Goal:** Essential user experience - browse, solve, and track problems

**Duration:** ~2.5 weeks
**Status:** 🟡 In Progress (Step 1A - 80% complete)
**Start Date:** 2025-10-11

### Step 1A: Frontend Implementation (2 weeks)

#### Screens to Build (5 screens):

**1. Home/Dashboard Page** (`/` or `/dashboard`) ✅ COMPLETE
- [x] Create HomePage component
- [x] Welcome header with user name
- [x] Quick stats cards (4 cards): problems solved, acceptance rate, streak, rank
- [x] Recent activity feed (5 most recent submissions with "View All" link)
- [x] Recommended problems section (4 problem cards)
- [x] Upcoming contests banner (placeholder for Phase 3)
- [x] Responsive grid layout (3 columns: 2 for activity/recommendations, 1 for contest)

**2. Problems List Page** (`/problems`) ✅ COMPLETE
- [x] Create ProblemsListPage component
- [x] Problem filters sidebar (status, difficulty, tags, search)
- [x] Problems table with pagination
- [x] Status indicators (solved/attempted/unsolved)
- [x] Difficulty badges with colors
- [x] Sort functionality (by ID, title, difficulty, acceptance rate)
- [x] Mobile responsive (table→cards)
- [x] Loading/empty/error states (skeletons, empty state components)

**3. Submissions History Page** (`/submissions`) ✅ COMPLETE
- [x] Create SubmissionsPage component
- [x] Filter bar (status, language, problem, date range)
- [x] Submissions table with pagination (15 items per page)
- [x] Status badges (accepted/wrong/TLE/MLE/runtime/compilation) with color coding
- [x] View code modal with syntax highlighting and copy button
- [x] Sortable columns (date, problem, status, language)
- [x] Responsive table (hides Time/Memory on mobile)
- [x] Stats summary cards (Total, Accepted, Acceptance Rate)

**4. User Profile Page** (`/profile/:username`) ✅ COMPLETE (simplified - charts pending)
- [x] Create ProfilePage component
- [x] Profile header (avatar, name, stats, bio, location, website, GitHub)
- [x] Stats cards (4 cards: Easy, Medium, Hard, Total with progress bars)
- [x] Tabs section (Solved Problems, Recent Activity)
- [x] Solved problems list with difficulty badges, tags, dates
- [x] Recent activity tab (reuses ActivityFeed)
- [x] Edit profile button (own profile only)
- [ ] Problems solved donut chart (requires recharts) - FUTURE
- [ ] Submission heatmap (GitHub-style, 365 days, requires recharts) - FUTURE
- [ ] Languages used chart (requires recharts) - FUTURE

**5. Settings Page** (`/settings`)
- [ ] Create SettingsPage component
- [ ] Tabs (Profile, Editor, Notifications, Account)
- [ ] Profile tab: avatar upload, name, bio, location
- [ ] Editor tab: theme, font size, keybindings, tab size
- [ ] Notifications tab: email toggles for various events
- [ ] Account tab: password change, connected accounts, deactivate
- [ ] Form validation with React Hook Form + Zod
- [ ] Save functionality with success/error feedback

#### Components to Build:

**Navigation & Layout:** ✅ COMPLETE
- [x] Navbar component (logo, nav links, search, notifications, user dropdown)
- [x] Footer component (links, copyright)
- [x] UserDropdown component (profile, settings, logout) - Integrated in Navbar
- [ ] PageHeader component (reusable header with title/actions) - Not needed yet

**UI Components:** ✅ 80% COMPLETE (8/10 built)
- [x] Avatar component (with fallback initials)
- [ ] Table component (with sorting, pagination) - Built custom in ProblemsTable
- [x] Pagination component
- [x] Modal/Dialog component
- [x] Dropdown component
- [x] Tooltip component
- [x] Skeleton loader component (ProblemsTableSkeleton, generic Skeleton)
- [x] Spinner component
- [x] EmptyState component
- [x] Toast/Snackbar component (react-hot-toast integrated in App.tsx)

**Domain Components:** ✅ 80% COMPLETE (Dashboard, Problems, Submissions & Profile components built)
- [x] StatsCard component (reusable stat display) - Inline in DashboardPage
- [ ] ProblemCard component (for grids) - Not needed yet
- [x] ProblemList component (table view) - ProblemsTable
- [x] ProblemFilters component (sidebar filters)
- [x] ActivityFeed component (recent submissions)
- [x] RecommendedProblems component
- [x] UpcomingContests component
- [x] SubmissionsFilters component
- [x] SubmissionsTable component
- [x] ViewCodeModal component
- [x] ProfileHeader component ✅ NEW
- [x] StatsCards component (difficulty breakdown) ✅ NEW
- [x] SolvedProblemsTab component ✅ NEW
- [x] RecentActivityTab component ✅ NEW
- [ ] SubmissionHeatmap component (using recharts) - FUTURE

#### State Management: ✅ 75% COMPLETE (3/4 slices built)
- [x] Create problemsSlice (list, filters, sorting, pagination, current problem)
- [x] Create submissionsSlice (list, filters, sorting, pagination, modal state)
- [x] Create userSlice (profile, stats, solved problems, calendar, active tab) ✅ NEW
- [ ] Create uiSlice (theme, modals, toasts) - Not needed yet
- [ ] Create custom hooks: useProblems, useUserProfile, useToast - Not needed (using existing useProblem, useSubmission hooks)

#### Mock Data: ✅ 100% COMPLETE (All mock data ready for Phase 1A)
- [x] Create mock data for user profile (365-day calendar, 42 solved problems) ✅ NEW
- [x] Create mock data for problems list (60 problems with tags, difficulty, acceptance rates)
- [x] Create mock data for submissions history (40 submissions with full code)
- [x] Create mock data for dashboard stats (hardcoded in DashboardPage)
- [x] Create mock data for recommended problems (4 problems with reasons)

#### Deliverables:
✅ **4 of 5 pages complete** (Dashboard, Problems List, Submissions History, User Profile) with mock data
✅ **25+ reusable components built** (Avatar, Modal, Dropdown, Pagination, Skeleton, Spinner, EmptyState, Tooltip, Badge, Button, Tabs, etc.)
✅ **Navigation structure complete** (Navbar with routing, Footer)
✅ **State management setup** (Redux store with problemsSlice, submissionsSlice, userSlice, editorSlice, authSlice)
✅ **Responsive design implemented** with Tailwind CSS v4
✅ **Modern gradient-based design system** with vibrant colors, shadows, glows, and animations
✅ **Complete mock data** for all 4 pages (60 problems, 40 submissions, 42 solved problems, 365-day calendar)

#### Files Created/Modified in Step 1A:
**Components:**
- `components/ui/modal.tsx`, `dropdown.tsx`, `avatar.tsx`, `spinner.tsx`, `skeleton.tsx`, `empty-state.tsx`, `tooltip.tsx`, `pagination.tsx`, `tabs.tsx`
- `components/layout/Navbar.tsx`, `Footer.tsx`
- `components/problems/ProblemsFilters.tsx`, `ProblemsTable.tsx`, `ProblemsTableSkeleton.tsx`
- `components/dashboard/ActivityFeed.tsx`, `RecommendedProblems.tsx`, `UpcomingContests.tsx`
- `components/submissions/SubmissionsFilters.tsx`, `SubmissionsTable.tsx`, `ViewCodeModal.tsx`
- `components/profile/ProfileHeader.tsx`, `StatsCards.tsx`, `SolvedProblemsTab.tsx`, `RecentActivityTab.tsx` ✅ NEW

**Pages:**
- `pages/DashboardPage.tsx` ✅
- `pages/ProblemsListPage.tsx` ✅
- `pages/SubmissionsHistoryPage.tsx` ✅
- `pages/ProfilePage.tsx` ✅ NEW

**State:**
- `store/slices/problemsSlice.ts` ✅
- `store/slices/submissionsSlice.ts` ✅
- `store/slices/userSlice.ts` ✅ NEW

**Mock Data:**
- `constants/mockProblemsData.ts` (60 problems)
- `constants/mockActivityData.ts` (10 submissions)
- `constants/mockRecommendedProblems.ts` (4 problems)
- `constants/mockSubmissionsData.ts` (40 submissions with code)
- `constants/mockUserData.ts` (profile, stats, 42 solved problems, 365-day calendar) ✅ NEW

**Styles:**
- `index.css` - Complete theme with gradients, shadows, animations

---

### Step 1B: Backend Implementation (1 week)

#### Database Migrations:

**1. User Statistics Table:**
```sql
-- Migration: user_stats table
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    problems_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    acceptance_rate DECIMAL(5,2) DEFAULT 0.00,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_submission_date TIMESTAMPTZ,
    rank INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. User Solve Status Table:**
```sql
-- Migration: user_problem_status table
CREATE TABLE user_problem_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- 'solved', 'attempted', 'unsolved'
    first_solved_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_user_problem_status_user ON user_problem_status(user_id);
CREATE INDEX idx_user_problem_status_problem ON user_problem_status(problem_id);
```

**3. Submissions Table:**
```sql
-- Migration: submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'
    execution_time INTEGER, -- milliseconds
    memory_used INTEGER, -- MB
    test_cases_passed INTEGER DEFAULT 0,
    test_cases_total INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_user ON submissions(user_id, created_at DESC);
CREATE INDEX idx_submissions_problem ON submissions(problem_id);
```

**4. User Preferences Table:**
```sql
-- Migration: user_preferences table
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    editor_theme VARCHAR(50) DEFAULT 'vs-dark',
    editor_font_size INTEGER DEFAULT 14,
    editor_font_family VARCHAR(100) DEFAULT 'monospace',
    editor_tab_size INTEGER DEFAULT 2,
    editor_keybindings VARCHAR(50) DEFAULT 'default',
    notifications_contest_reminders BOOLEAN DEFAULT TRUE,
    notifications_new_problems BOOLEAN DEFAULT TRUE,
    notifications_problem_approvals BOOLEAN DEFAULT TRUE,
    notifications_assessments BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### API Endpoints to Build:

**Problems API:**
- [ ] `GET /api/problems` - List problems with filters (difficulty, tags, status, search)
  - Query params: `difficulty`, `tags`, `status`, `search`, `page`, `limit`, `sort`
  - Response: `{ problems: [], total: number, page: number, totalPages: number }`
  - Include user's solve status for each problem

- [ ] `GET /api/problems/:id` - Get single problem (already exists, may need enhancement)
  - Include user's submissions count and best result

**User Profile API:**
- [ ] `GET /api/users/me` - Get current user profile
  - Response: user data + stats + preferences

- [ ] `GET /api/users/:username` - Get public user profile
  - Response: public user data + stats + solved problems

- [ ] `PUT /api/users/me` - Update current user profile
  - Body: `{ name, bio, location, website, avatar_url }`

- [ ] `GET /api/users/:id/stats` - Get user statistics
  - Response: problems solved, acceptance rate, streak, rank, charts data

- [ ] `GET /api/users/:id/solved` - Get problems solved by user
  - Query params: `difficulty`, `page`, `limit`
  - Response: list of problems with solve date

**Submissions API:**
- [ ] `GET /api/submissions` - Get current user's submissions
  - Query params: `problem_id`, `status`, `language`, `date_from`, `date_to`, `page`, `limit`
  - Response: paginated submissions list

- [ ] `GET /api/submissions/:id` - Get single submission detail
  - Response: full submission with code, test results, execution stats

- [ ] `POST /api/problems/:id/submit` - Submit code (enhance existing)
  - Body: `{ code, language }`
  - Save to submissions table
  - Update user_problem_status
  - Update user_stats
  - Return execution results

**Dashboard API:**
- [ ] `GET /api/users/me/dashboard` - Get dashboard data
  - Response: stats cards, recent activity, recommended problems, upcoming contests

**Settings API:**
- [ ] `GET /api/users/me/preferences` - Get user preferences
- [ ] `PUT /api/users/me/preferences` - Update preferences
  - Body: editor and notification settings

- [ ] `POST /api/users/me/change-password` - Change password
  - Body: `{ current_password, new_password }`

#### Backend Tasks:
- [ ] Create database migrations (4 new tables)
- [ ] Create models/structs for new tables
- [ ] Implement problems list handler with filters and pagination
- [ ] Implement user profile handler (me and public)
- [ ] Implement user stats calculation logic
- [ ] Implement submissions list handler with filters
- [ ] Implement submission detail handler
- [ ] Enhance submit handler to save to database
- [ ] Create triggers/functions to update user_stats on submission
- [ ] Implement dashboard data aggregation
- [ ] Implement preferences CRUD handlers
- [ ] Add middleware for role-based access control
- [ ] Write unit tests for new handlers
- [ ] Write integration tests for API endpoints

#### Deliverables:
✅ 4 new database tables with migrations
✅ 15+ API endpoints functional
✅ User statistics calculation
✅ Submission tracking system
✅ Test coverage

---

### Step 1C: Integration & Testing (2-3 days)

#### Integration Tasks:
- [ ] Replace mock data with API calls in HomePage
- [ ] Connect ProblemsListPage to `/api/problems`
- [ ] Connect ProfilePage to `/api/users/:username` and `/api/users/:id/stats`
- [ ] Connect SubmissionsPage to `/api/submissions`
- [ ] Connect SettingsPage to `/api/users/me` and `/api/users/me/preferences`
- [ ] Integrate toast notifications for API errors
- [ ] Add loading states during API calls
- [ ] Handle error responses gracefully
- [ ] Test pagination on all pages
- [ ] Test filters and search functionality
- [ ] Test form submissions (profile, settings)

#### End-to-End Testing:
- [ ] User can view dashboard with real stats
- [ ] User can browse and filter problems
- [ ] User can view own profile with accurate stats
- [ ] User can view other users' profiles
- [ ] User can view submission history with filters
- [ ] User can update profile information
- [ ] User can change editor preferences
- [ ] User can change password
- [ ] Charts render correctly with real data
- [ ] Heatmap shows actual submission activity
- [ ] Mobile responsiveness works on all pages

#### Bug Fixes & Polish:
- [ ] Fix any API integration issues
- [ ] Optimize slow API calls (add indexes if needed)
- [ ] Add error boundaries for crashed components
- [ ] Polish loading skeletons
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)

#### Phase 1 Demo:
- [ ] Prepare demo script
- [ ] Record demo video (optional)
- [ ] Get feedback from stakeholders
- [ ] Document known issues for Phase 2

#### Deliverables:
✅ Fully functional Phase 1 features end-to-end
✅ No mock data, all real API calls
✅ Tested on multiple devices and browsers
✅ Demo completed
✅ Ready for Phase 2

---

## **Phase 1 Progress Tracking**

### Overall Phase 1 Status:
- **Step 1A (Frontend):** 80% (~40/50 tasks complete)
  - ✅ 4 of 5 screens complete (Dashboard, Problems List, Submissions History, User Profile)
  - ✅ 25+ UI components built (including Tabs)
  - ✅ Navigation & layout complete
  - ✅ Redux problemsSlice, submissionsSlice & userSlice complete
  - ✅ Mock data for Dashboard, Problems, Submissions & Profile (365-day calendar)
  - ⏳ 1 screen pending (Settings)
  - ⏳ Charts/heatmap for profile (requires recharts) - FUTURE
- **Step 1B (Backend):** 0% (0/25 tasks)
- **Step 1C (Integration):** 0% (0/20 tasks)
- **Overall:** 25% (~40/95 tasks)

### Time Tracking:
- **Estimated:** 2.5 weeks
- **Actual:** TBD (in progress)
- **Start Date:** 2025-10-11
- **End Date:** TBD

### Completed in Step 1A So Far:
✅ **Screens:** Dashboard Page, Problems List Page, Submissions History Page, User Profile Page (4/5)
✅ **Components:** 25+ UI components (Modal, Dropdown, Avatar, Pagination, Skeleton, Spinner, EmptyState, Tooltip, Tabs, etc.)
✅ **Layout:** Navbar, Footer
✅ **State:** problemsSlice, submissionsSlice & userSlice with filters, sorting, pagination, tabs
✅ **Mock Data:** 60 problems, 40 submissions with code, 10 activity items, 4 recommended problems, 42 solved problems, 365-day calendar
✅ **Design System:** Modern gradient-based theme with vibrant colors, shadows, glows, animations
✅ **Profile Components:** ProfileHeader, StatsCards (4 difficulty cards), SolvedProblemsTab, RecentActivityTab

### Next Steps in Step 1A:
🔜 **Settings Page** (`/settings`) - LAST SCREEN
🔜 Profile charts/heatmap (optional - requires recharts integration) - FUTURE

---

## 📱 PHASE 2: Admin Panel
**Goal:** Content and user management for admins

**Duration:** ~2.5 weeks
**Status:** 🔴 Not Started (0%)

### Step 2A: Frontend Implementation (2 weeks)

#### Screens to Build (7 screens):

**6. Admin Dashboard** (`/admin`)
- [ ] Create AdminDashboardPage component
- [ ] Platform stats cards (6 cards)
- [ ] User growth line chart
- [ ] Submissions bar chart
- [ ] Quick actions section
- [ ] Recent activity feed
- [ ] Pending approvals indicator
- [ ] System health metrics (optional)

**7. Problem Management Page** (`/admin/problems`)
- [ ] Create ProblemManagementPage component
- [ ] Filter tabs (All/Pending/Approved/Rejected)
- [ ] Problems table with bulk actions
- [ ] Status badges and indicators
- [ ] Actions dropdown per row (Edit, Review, Duplicate, Delete)
- [ ] Pagination and search
- [ ] Export to CSV functionality

**8. Problem Create/Edit Page** (`/admin/problems/new` or `/:id/edit`)
- [ ] Create ProblemEditorPage component
- [ ] Rich text editor for description (TinyMCE integration)
- [ ] Form sections (8 sections as per spec)
- [ ] Tags multi-select with autocomplete
- [ ] Examples management (add/remove/reorder)
- [ ] Test cases management (Sample/Hidden tabs)
- [ ] Solution templates for each language
- [ ] Editorial editor (optional)
- [ ] Form validation (Zod schemas)
- [ ] Auto-save draft functionality
- [ ] Preview modal

**9. Problem Review Page** (`/admin/problems/:id/review`)
- [ ] Create ProblemReviewPage component
- [ ] Problem preview (rendered HTML)
- [ ] Test validation section (run sample tests)
- [ ] Review comments section with history
- [ ] Review actions (Approve, Reject, Request Changes)
- [ ] Diff view for edited problems
- [ ] Author information display

**10. User Management Page** (`/admin/users`)
- [ ] Create UserManagementPage component
- [ ] Filter tabs (All/Active/Inactive)
- [ ] Role filter checkboxes
- [ ] Users table with bulk actions
- [ ] Search by name/email
- [ ] Date range filters
- [ ] Change role modal
- [ ] Export to CSV

**11. User Detail Page** (`/admin/users/:id`)
- [ ] Create UserDetailPage component
- [ ] User header with action buttons
- [ ] Tabs (Profile, Activity, Submissions, Problems Authored)
- [ ] Activity timeline
- [ ] Admin notes section (internal)
- [ ] Role management

**12. Tags Management Page** (`/admin/tags`)
- [ ] Create TagsManagementPage component
- [ ] Tags table (name, usage count, actions)
- [ ] Create/Edit tag modal
- [ ] Merge tags modal
- [ ] Delete confirmation with warning
- [ ] Sort by name/usage

#### Components to Build:
- [ ] RichTextEditor wrapper component (TinyMCE)
- [ ] CodeViewer component (read-only syntax highlighted)
- [ ] AdvancedTable component (filters, sorting, bulk actions)
- [ ] FileUpload component (drag-and-drop)
- [ ] Breadcrumbs component
- [ ] DateRangePicker component
- [ ] ActivityFeed component
- [ ] StatsCard component (for admin dashboard)
- [ ] UserManagement table component
- [ ] ProblemReview component

#### State Management:
- [ ] Create adminSlice (platform stats, pending queue)
- [ ] Extend problemsSlice for admin actions
- [ ] Custom hooks: useAdminStats, useProblemReview

#### Deliverables:
✅ 7 admin pages fully functional with mock data
✅ Rich text editor integrated
✅ Advanced forms with validation
✅ Role-based UI components

---

### Step 2B: Backend Implementation (1 week)

#### Database Migrations:

**1. Problem Reviews Table:**
```sql
-- Migration: problem_reviews table
CREATE TABLE problem_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(20) NOT NULL, -- 'approve', 'reject', 'request_changes'
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_problem_reviews_problem ON problem_reviews(problem_id, created_at DESC);
```

**2. Activity Log Table:**
```sql
-- Migration: activity_log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'problem', 'contest', 'user', 'submission'
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
```

**3. Admin Notes Table:**
```sql
-- Migration: admin_notes table
CREATE TABLE admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'problem', 'contest'
    entity_id UUID NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_notes_entity ON admin_notes(entity_type, entity_id, created_at DESC);
```

#### API Endpoints to Build:

**Admin Dashboard:**
- [ ] `GET /api/admin/stats` - Platform statistics
  - Response: user counts, problem counts, submission stats, growth percentages

- [ ] `GET /api/admin/activity` - Recent activity feed
  - Response: last 50 activities across platform

**Problem Management (Admin):**
- [ ] `GET /api/admin/problems` - All problems (admin view)
  - Query params: `status`, `difficulty`, `author`, `page`, `limit`
  - Response: includes pending count, author info

- [ ] `GET /api/admin/problems/pending` - Pending problems
  - Response: problems with status='pending' or 'requested_changes'

- [ ] `POST /api/admin/problems` - Create problem (admin/author)
  - Body: complete problem object with test cases
  - Validate all required fields

- [ ] `PUT /api/admin/problems/:id` - Update problem
  - Body: updated problem data
  - Check authorization (admin or author)

- [ ] `DELETE /api/admin/problems/:id` - Delete problem (admin only)

- [ ] `POST /api/admin/problems/:id/approve` - Approve problem
  - Body: `{ comment }`
  - Update status to 'approved'
  - Log to problem_reviews

- [ ] `POST /api/admin/problems/:id/reject` - Reject problem
  - Body: `{ reason }`
  - Update status to 'rejected'
  - Log to problem_reviews

- [ ] `POST /api/admin/problems/:id/request-changes` - Request changes
  - Body: `{ feedback }`
  - Update status to 'requested_changes'
  - Log to problem_reviews

- [ ] `GET /api/admin/problems/:id/reviews` - Get review history

**User Management (Admin):**
- [ ] `GET /api/admin/users` - List all users
  - Query params: `role`, `status`, `search`, `date_from`, `date_to`, `page`, `limit`
  - Response: users with roles and activity info

- [ ] `GET /api/admin/users/:id` - Get user detail (admin view)
  - Response: full user info + activity + notes

- [ ] `PUT /api/admin/users/:id/role` - Change user role
  - Body: `{ roles: ['admin', 'author', 'user'] }`
  - Validate roles

- [ ] `POST /api/admin/users/:id/deactivate` - Deactivate user
  - Update is_active to false

- [ ] `POST /api/admin/users/:id/activate` - Activate user

- [ ] `POST /api/admin/users/:id/notes` - Add admin note
  - Body: `{ note }`

- [ ] `GET /api/admin/users/:id/notes` - Get admin notes

- [ ] `GET /api/admin/users/:id/activity` - Get user activity log

**Tags Management:**
- [ ] `GET /api/tags` - List all tags
  - Response: tags with usage count

- [ ] `POST /api/admin/tags` - Create tag (admin only)
  - Body: `{ name, description }`

- [ ] `PUT /api/admin/tags/:id` - Update tag
  - Body: `{ name, description }`

- [ ] `DELETE /api/admin/tags/:id` - Delete tag
  - Check if used by problems (warn or prevent)

- [ ] `POST /api/admin/tags/:id/merge` - Merge tags
  - Body: `{ target_tag_id }`
  - Move all problems to target, delete source

#### Backend Tasks:
- [ ] Create migrations (3 new tables)
- [ ] Implement admin dashboard stats aggregation
- [ ] Implement problem CRUD with authorization checks
- [ ] Implement problem review workflow handlers
- [ ] Implement user management handlers
- [ ] Implement activity logging (middleware)
- [ ] Implement tags CRUD handlers
- [ ] Add role-based middleware (admin-only routes)
- [ ] Write tests for all new endpoints

#### Deliverables:
✅ 3 new database tables
✅ 25+ new API endpoints
✅ Problem review workflow
✅ User management system
✅ Activity logging

---

### Step 2C: Integration & Testing (2-3 days)

#### Integration Tasks:
- [ ] Connect Admin Dashboard to real API
- [ ] Connect Problem Management to `/api/admin/problems`
- [ ] Integrate problem creation/editing with backend
- [ ] Connect review workflow to API
- [ ] Integrate user management
- [ ] Connect tags management
- [ ] Test bulk actions (approve multiple, delete multiple)
- [ ] Test rich text editor save/load
- [ ] Test file uploads (if any)

#### Testing:
- [ ] Admin can view platform statistics
- [ ] Admin can create/edit/delete problems
- [ ] Admin can approve/reject problems
- [ ] Author can create problems, but only edit own
- [ ] Admin can manage users and roles
- [ ] Admin can view user activity
- [ ] Admin can add internal notes
- [ ] Tags CRUD works correctly
- [ ] Activity logging captures actions

#### Deliverables:
✅ Phase 2 complete and functional
✅ Demo completed

---

## 📱 PHASE 3: Contest System
**Goal:** Complete competitive programming experience

**Duration:** ~3.5 weeks
**Status:** 🔴 Not Started (0%)

### Step 3A: Frontend Implementation (2.5 weeks)

#### Screens to Build (7 screens):

**13-19:** (Contest-related screens as per original plan)
- [ ] Contests List, Contest Detail, Contest Problems, Contest Problem Solving, Leaderboard, Contest Editor, Contest Management Dashboard

#### Key Features:
- Countdown timers
- Real-time leaderboard
- Customizable visibility settings
- Live submissions feed
- Contest registration flow

---

### Step 3B: Backend Implementation (1 week)

#### Database Migrations:
- `contests` table
- `contest_problems` table (join table with points)
- `contest_registrations` table
- `contest_submissions` table
- `contest_leaderboard` (materialized view or cached table)
- `contest_announcements` table

#### API Endpoints:
- Contest CRUD
- Registration/unregistration
- Contest problems
- Leaderboard with visibility logic
- Live submissions feed (WebSocket or SSE)
- Announcements

---

### Step 3C: Integration & Testing (3 days)

- WebSocket/SSE integration for real-time updates
- Contest timer functionality
- Leaderboard updates
- End-to-end contest flow testing

---

## 📱 PHASE 4: Recruitment/Assessment System
**Goal:** Complete recruitment tools with reporting

**Duration:** ~3.5 weeks
**Status:** 🔴 Not Started (0%)

### Step 4A: Frontend Implementation (2.5 weeks)

#### Screens to Build (9 screens):
**20-28:** (Assessment-related screens as per original plan)

#### Key Features:
- Token-based access for candidates
- Proctoring indicators
- Detailed candidate reports
- Candidate comparison
- Email invitations

---

### Step 4B: Backend Implementation (1 week)

#### Database Migrations:
- `assessments` table
- `assessment_problems` table
- `assessment_invitations` table (with unique tokens)
- `assessment_submissions` table
- `assessment_proctoring_logs` table
- `assessment_reports` table (cached/computed data)

#### API Endpoints:
- Assessment CRUD
- Candidate invitation (email sending)
- Token validation and assessment access
- Proctoring logs
- Candidate reports generation
- Comparison data

---

### Step 4C: Integration & Testing (3 days)

- Token-based authentication
- Email sending integration
- PDF report generation
- Proctoring data capture
- End-to-end candidate flow

---

## 📱 PHASE 5: Analytics & Polish
**Goal:** Insights, optimization, and final polish

**Duration:** ~1.5 weeks
**Status:** 🔴 Not Started (0%)

### Step 5A: Frontend Implementation (1 week)

#### Screens:
- Platform Analytics
- Personal Analytics
- Notifications panel
- Global search

#### Polish:
- Loading states
- Error boundaries
- Accessibility audit
- Performance optimization
- Mobile responsiveness review

---

### Step 5B: Backend Implementation (2-3 days)

#### Analytics:
- Aggregation queries for platform analytics
- Personal analytics calculations
- Notifications system
- Search indexing (full-text search)

---

### Step 5C: Integration & Testing (2 days)

- Charts integration
- Notifications working
- Search functional
- Final end-to-end testing
- Performance testing
- Security audit

---

## 🎨 Design System & Technical Specs

### Frontend Tech Stack:
- React 19 + TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS v4
- Monaco Editor
- Axios
- Vite

### Libraries to Add:
- React Hook Form + Zod
- Recharts
- TanStack Table
- Lucide React
- date-fns
- React Hot Toast
- TinyMCE
- React Syntax Highlighter

### Backend Tech Stack:
- Go with **Chi router** (`github.com/go-chi/chi/v5`) ✅
- PostgreSQL ✅
- **RabbitMQ** (message queue for async execution) ✅
- Docker (for code execution) ✅
- Goose (migrations) ✅
- JWT (authentication) ✅
- **SMTP** (email service via `gopkg.in/mail.v2`) ✅
- WebSocket (real-time features) - Planned

### Database:
- PostgreSQL 14+
- Connection pooling
- Indexes for performance
- Triggers for auto-updates

---

## 📡 API Endpoints Reference

### Complete API List:
(See original document for full endpoint specifications)

**Authentication:** 6 endpoints
**Problems:** 9 endpoints
**Users:** 6 endpoints
**Submissions:** 2 endpoints
**Contests:** 15+ endpoints
**Assessments:** 15+ endpoints
**Admin:** 20+ endpoints
**Analytics:** 2 endpoints
**Notifications:** 3 endpoints
**Settings:** 2 endpoints

**Total:** ~80+ API endpoints across all phases

---

## 📊 Overall Progress Tracking

### Phase Completion:
- [ ] Phase 1: Core Platform (0%)
- [ ] Phase 2: Admin Panel (0%)
- [ ] Phase 3: Contest System (0%)
- [ ] Phase 4: Recruitment/Assessment (0%)
- [ ] Phase 5: Analytics & Polish (0%)

### Overall Project:
- **Total Screens:** 30+
- **Total Components:** 100+
- **Total API Endpoints:** 80+
- **Database Tables:** 25+
- **Completion:** 0%

### Timeline:
- **Estimated Total:** ~13-14 weeks (3-3.5 months)
- **Start Date:** TBD
- **Target Completion:** TBD

---

## 🎯 Success Criteria

### Functional:
✅ All 30+ screens implemented and working
✅ Role-based access control (frontend + backend)
✅ Real-time features (leaderboards, timers)
✅ Complete recruitment workflow
✅ End-to-end tested

### Non-Functional:
✅ Performance: < 3s page load, < 200ms API response (p95)
✅ Accessibility: WCAG AA compliant
✅ Security: Authentication, authorization, input validation
✅ Responsive: Works on mobile, tablet, desktop
✅ Browser support: Chrome, Firefox, Safari, Edge (latest 2)

---

## 📝 Notes for Development

### Best Practices:
1. **Commit frequently** with meaningful messages
2. **Write tests** as you build (TDD encouraged)
3. **Document as you go** (API docs, component docs)
4. **Code review** before merging to main
5. **Demo after each phase** to get feedback
6. **Track time spent** vs estimates for future planning

### When to Update This Document:
- ✅ Check off tasks as completed
- 📊 Update progress percentages
- 📅 Update dates (start, end, actual time)
- 🐛 Document blockers or issues
- 💡 Add notes about decisions made
- 🔄 Revise estimates if needed

---

**End of Development Plan**

_This is a living document. Update regularly to reflect actual progress and learnings._
