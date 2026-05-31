# EduCity LMS — Complete Project Summary

> Generated: 2026-04-28 | Branch: main | Stack: MERN + eSewa + Cloudinary + Gmail SMTP

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features by User Role](#2-features-by-user-role)
3. [Payment System — eSewa Integration](#3-payment-system--esewa-integration)
4. [Certificate System](#4-certificate-system)
5. [Database Architecture](#5-database-architecture)
6. [API Documentation](#6-api-documentation)
7. [Frontend Routes & Pages](#7-frontend-routes--pages)
8. [Recent Implementations](#8-recent-implementations)
9. [Tech Stack & Dependencies](#9-tech-stack--dependencies)
10. [Environment Configuration](#10-environment-configuration)
11. [Known Issues & Incomplete Features](#11-known-issues--incomplete-features)
12. [Future Enhancements](#12-future-enhancements)

---

## 1. Project Overview

### Architecture

EduCity is a full-stack Learning Management System following the **MVC pattern** with a REST API backend and a React SPA frontend.

```
educity/
├── backend/                     # Express.js REST API (Node 18+, ES modules)
│   ├── src/
│   │   ├── app.js               # Express app — middleware + route mounting
│   │   ├── server.js            # Entry point — DB connect + listen
│   │   ├── models/              # Mongoose schemas (10 collections)
│   │   ├── controllers/         # Request handlers
│   │   ├── routes/              # Express routers
│   │   ├── middleware/          # Auth, role guards, error handling
│   │   ├── services/            # Business logic (certs, payments, performance)
│   │   ├── config/              # Cloudinary, Passport.js, DB
│   │   └── utils/               # JWT helpers, logger
└── frontend/                    # React 19 SPA (Vite + TypeScript)
    └── src/
        ├── App.tsx              # Route definitions
        ├── api/axios.ts         # Axios instance with JWT interceptor
        ├── store/authStore.ts   # Zustand global auth state
        ├── pages/               # Page components (public + role-scoped)
        └── components/          # Shared components (ProfileDropdown, Navbar…)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ with ES modules (`"type": "module"`) |
| Backend Framework | Express.js 4.19 |
| Database | MongoDB (local dev) via Mongoose 8.7 |
| Authentication | JWT (`jsonwebtoken 9`) + Passport.js Google OAuth 2.0 |
| File Uploads | Multer + Cloudinary (images, videos, PDFs) |
| Email | Nodemailer 8 (Gmail SMTP) |
| PDF Generation | PDFKit 0.18 |
| Payments | eSewa UAT gateway (Nepal) |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 3 (dark theme throughout) |
| State Management | Zustand 5 |
| HTTP Client | Axios 1.14 |
| Routing | React Router DOM 7 |
| Notifications | React Hot Toast 2 |

### Authentication System

- **JWT** stored in `localStorage` — sent as `Authorization: Bearer <token>` header
- **authMiddleware** (`backend/src/middleware/authMiddleware.js`) validates token, loads user, checks `isBlocked`
- **roleMiddleware** (`backend/src/middleware/roleMiddleware.js`) enforces role-based access
- **Google OAuth 2.0** via Passport.js — callback at `/api/auth/google/callback`, handled by `OAuthSuccess.tsx` on frontend
- Three roles: `student`, `teacher`, `admin` — stored on User document, enforced on every protected route
- **ProtectedRoute** component (`frontend/src/components/ProtectedRoute.tsx`) gates all authenticated frontend routes

---

## 2. Features by User Role

### Student Features ✅

#### Account & Profile
- Register with email/password or Google OAuth (role: student)
- View and edit profile (`/profile`) — shows name, email, role, member since, performance metrics
- Performance metrics automatically tracked: quizzes taken, average score, total points, average completion time

#### Discovery & Enrollment
- **Public course preview** (`/courses/:courseId`) — view title, description, lessons (locked), instructor, stats — no login required
- **Student Home** (`/student/home`) — post-login landing page with enrolled courses at top + browse all courses below
- **Browse Courses** (`/student/browse-courses`) — searchable dark-theme grid of all approved courses
- **Free course enrollment** — "Request Enrollment" → pending admin approval workflow
- **Paid course enrollment** — "Pay Rs. X with eSewa" → eSewa UAT gateway → auto-approved on payment success
- Enrollment statuses: `pending` | `approved` | `rejected`

#### Learning
- **Course Detail** (`/student/courses/:courseId`) — lesson list with completion status
- **Lesson View** (`/student/lessons/:lessonId`) — supports:
  - Video playback (Cloudinary-hosted MP4)
  - Article/text content
  - PDF viewer (Cloudinary-hosted)
  - Cover images
- **Lesson progress tracking** — mark lessons complete via `POST /api/student/lessons/:lessonId/complete`
- Course completion percentage calculated from completed lesson count

#### Assessments
- **Available quizzes** shown on StudentDashboard — sourced from `availableQuizzes` in dashboard API
- **Take Quiz** (`/student/quizzes/:quizId/take`) — countdown timer, inline unanswered-questions confirm dialog (replaces `window.confirm`)
- Auto-submit on timer expiry
- Instant results modal on submission — shows score, percentage, pass/fail badge

#### Results & Certificates
- **Quiz Results** (`/student/quiz-results`) — history of all attempts with stats (total, passed, avg score, pass rate)
- **Certificate earned** automatically on passing quiz (≥ passing score %)
- **Certificates page** (`/student/certificates`) — list of earned certificates
- Certificate PDF emailed automatically after passing

#### Instructor Eligibility
- Automatically flagged as `instructorEligible` after: ≥ 3 quizzes taken AND ≥ 80% average score
- Eligible students can request promotion from QuizResults page (85%+ on a quiz)
- Admin promotes eligible students to `teacher` role

---

### Teacher Features ✅

#### Course Management
- **Teacher Dashboard** (`/teacher/dashboard`) — course count, enrolled students, recent enrollments, impact/reputation score
- **Create Course** (`/teacher/create-course`) — form fields: thumbnail (Cloudinary image upload), title, description, category (7 options), difficulty level (3 options), duration (hours), price (NPR — 0 = free)
- Courses start as `status: pending` — require admin approval before students can see them

#### Lesson Management
- **Manage Lessons** (`/teacher/courses/:courseId/lessons`) — full CRUD for lessons
- Each lesson supports: title, type (video/article/mixed), content (rich text), video upload (Cloudinary, up to 500 MB), cover image, PDF attachment, order/sequence, duration label
- Video upload shows progress bar during upload

#### Quiz Management
- **Create Quiz** (`/teacher/create-quiz`) — multi-question builder
- Each question: text, 4 options, correct answer (index), points value
- Quiz settings: duration (minutes), passing score (%)
- Quizzes start as `status: pending` — require admin approval

#### Analytics
- Teacher reputation score (calculated from enrolled students, quiz performance, course quality)
- View enrollment counts per course

---

### Admin Features ✅

#### Dashboard (`/admin/dashboard`)
- Platform stats: Total Students, Total Teachers, Total Courses, Approved Courses, Pending Courses, Total Enrollments
- Quick action cards: Enroll Student, Approve Courses, Approve Quizzes, Instructor Eligibility, Payment Logs

#### User Management
- View all students
- Block/unblock users
- Delete users (cascades to enrollments, quiz attempts, lesson progress)
- Create teacher accounts directly

#### Content Moderation
- **Course Approvals** (`/admin/course-approvals`) — review pending courses, approve or reject
- **Quiz Approvals** (`/admin/quiz-approvals`) — review pending quizzes, approve or reject

#### Enrollment Control
- **Enroll Student** (`/admin/enroll-student`) — manually enroll any student in any course (bypass pending flow)
- Remove enrollments

#### Instructor Management
- **Instructor Eligibility** (`/admin/instructor-eligibility`) — view all students who meet promotion criteria
- Promote student to teacher or reject
- Promotion changes `role: 'teacher'` on User document

#### Payment Monitoring
- **Payment Logs** (`/admin/payments`) — table of all transactions
- Filter by status: All / Success / Pending / Failed
- Shows: Student, Course, Amount, Method, Status (badge), Transaction ID, Date
- Total revenue summary (sum of successful payments)

---

## 3. Payment System — eSewa Integration

### Flow Overview

```
Student clicks "Pay Rs. X with eSewa"
    │
    ▼
POST /api/payments/esewa/initiate (authenticated)
    │ paymentService.initiateEsewaPayment()
    │ - Creates Payment document (status: pending)
    │ - Generates UUID transactionId
    │ - Calculates 20% platform fee / 80% instructor share
    │
    ▼
Frontend auto-submits hidden HTML form → eSewa UAT Gateway
(https://uat.esewa.com.np/epay/main)
    │
    ▼
eSewa processes payment → redirects to success/failure URL
    │
    ▼
GET /api/payments/esewa/success?oid=<txId>&amt=<amount>&refId=<esewaRef>
    │ paymentController.handleSuccessCallback()
    │ 1. Find Payment by transactionId
    │ 2. Verify amount matches
    │ 3. Verify with eSewa server (POST /epay/transrec)
    │ 4. Save esewaRefId, mark payment status: success
    │ 5. recordSuccessfulEnrollment() → Enrollment.status = 'approved'
    │
    ▼
Redirect to /student/home?payment=success
StudentHome shows toast.success("Payment successful! You are now enrolled.")
```

### Free Course Flow (unchanged)
```
Student clicks "Request Enrollment"
    │
POST /api/payments/esewa/initiate
    │ course.isFree === true → skip eSewa
    │ Create Enrollment(status: 'pending')
    │
    ▼
Admin manually approves via Course Approvals
```

### Revenue Split Logic

| Party | Share | Calculation |
|-------|-------|-------------|
| Platform | 20% | `Math.round(totalAmount * 0.20)` |
| Instructor | 80% | `totalAmount - platformFee` |

Stored on Payment document as `platformFee` and `instructorShare` (for future payout implementation).

### Key Files

| File | Purpose |
|------|---------|
| `backend/src/models/Payment.js` | Payment schema |
| `backend/src/services/paymentService.js` | eSewa initiation, verification, enrollment recording |
| `backend/src/controllers/paymentController.js` | HTTP handlers |
| `backend/src/routes/paymentRoutes.js` | Route definitions |
| `frontend/src/pages/CoursePreview.tsx` | Enroll button + form submission |
| `frontend/src/pages/student/StudentHome.tsx` | Payment result toast |
| `frontend/src/pages/admin/PaymentLogs.tsx` | Admin payment table |

### eSewa Configuration

| Variable | UAT Value |
|----------|-----------|
| `ESEWA_MERCHANT_ID` | `EPAYTEST` |
| `ESEWA_GATEWAY_URL` | `https://uat.esewa.com.np/epay/main` |
| `ESEWA_VERIFY_URL` | `https://uat.esewa.com.np/epay/transrec` |

> **Note:** For production, change `ESEWA_MERCHANT_ID` to the registered merchant ID and update URLs to the live eSewa endpoints.

---

## 4. Certificate System

### Generation Flow

```
Student submits quiz → studentController.submitQuiz()
    │
    ├── Score calculated (correct answers × point values)
    ├── QuizAttempt document saved
    ├── performanceService.updateStudentPerformance() called
    │     └── Recalculates averageScore, totalPoints, totalQuizzesTaken
    │         checkInstructorEligibility() → sets instructorEligible flag
    │
    └── if (percentage >= passingScore):
            certificateService.generateCertificatePDF()
                │
                ├── Generates unique certificateNumber (e.g., CERT-2024-XXXXX)
                ├── Creates PDF (landscape A4) using PDFKit:
                │     - EduCity branding/header
                │     - Student name (large font)
                │     - Course name
                │     - Score and percentage
                │     - Certificate number
                │     - Issue date
                ├── Saves PDF to /certificates/ directory (local filesystem)
                ├── Creates Certificate document in MongoDB
                └── emailService.sendCertificateEmail()
                      └── Attaches PDF via nodemailer (Gmail SMTP)
                          Sends to student's email address
```

### Certificate Verification

- Public endpoint: `GET /api/certificates/verify/:certNumber`
- No authentication required — accessible at `/verify/:certNumber` on frontend
- Returns student name, course name, issue date
- Can be shared publicly

### Key Files

| File | Purpose |
|------|---------|
| `backend/src/services/certificateService.js` | PDF generation + email trigger |
| `backend/src/services/emailService.js` | Nodemailer Gmail SMTP |
| `backend/src/models/Certificate.js` | Certificate schema |
| `backend/src/routes/certificateRoutes.js` | Student certificate list endpoint |
| `frontend/src/pages/student/Certificates.tsx` | Certificate display page |
| `frontend/src/pages/VerifyCertificate.tsx` | Public certificate verification |

---

## 5. Database Architecture

### Collections Overview

```
MongoDB: educity (local) / educity (atlas for production)

users           ── core user accounts (all roles)
courses         ── teacher-created courses
lessons         ── course lessons (courseId FK)
enrollments     ── student-course enroll records
quizzes         ── quizzes linked to courses
quizattempts    ── student quiz submissions + scores
lessonprogresses── per-student lesson completion tracking
certificates    ── issued certificates with PDF path
payments        ── eSewa payment records
activities      ── system-wide audit log
sessions        ── scheduled live sessions (future feature)
```

### Schema Details

#### users
```js
name:               String (required, trim)
email:              String (required, unique, lowercase)
password:           String (optional — absent for Google users)
googleId:           String (unique, sparse)
isGoogleUser:       Boolean (default: false)
isBlocked:          Boolean (default: false)
role:               String enum ['student','teacher','admin'] (default: 'student')
avatar:             String (auto-generated ui-avatars URL)
instructorEligible: Boolean (default: false)
instructorApproved: Boolean (default: false)
teacherQualification: String
performanceMetrics: {
  totalQuizzesTaken:       Number (default: 0)
  averageScore:            Number (default: 0)
  totalPointsEarned:       Number (default: 0)
  averageCompletionTime:   Number in seconds (default: 0)
}
promotedToInstructorAt: Date
// Pre-save: bcrypt password hash (skips if Google user)
// Method: comparePassword(candidate) → Boolean
```

#### courses
```js
title:           String (required, trim)
description:     String (required)
teacher:         ObjectId → users (required)
category:        String enum ['General','Programming','Data Science',
                              'Web Development','Mobile','DevOps',
                              'Design','Business','Other']
level:           String enum ['beginner','intermediate','advanced']
thumbnail:       String (Cloudinary URL)
totalLessons:    Number (default: 0)
status:          String enum ['draft','pending','approved','rejected']
enrollmentCount: Number (default: 0)
duration:        Number in hours (default: 0)
price:           Number in NPR (default: 0, min: 0)
isFree:          Boolean (default: true)
// Pre-save: isFree = (price === 0)
```

#### lessons
```js
courseId:    ObjectId → courses (required)
title:       String (required)
type:        String enum ['video','article','mixed']
content:     String (article body or description)
videoUrl:    String (Cloudinary URL)
coverImage:  String (Cloudinary URL)
duration:    String (display label, e.g. "12 min")
order:       Number (sort order within course)
pdfUrl:      String (Cloudinary URL)
pdfPublicId: String (Cloudinary public ID for deletion)
status:      String enum ['active','inactive']
```

#### enrollments
```js
student:          ObjectId → users (required)
course:           ObjectId → courses (required)
progress:         Number 0–100 (completion %)
status:           String enum ['pending','approved','rejected']
completedLessons: Number
enrolledAt:       Date
// Compound index: { student: 1, course: 1 }
```

#### quizzes
```js
course:       ObjectId → courses (required)
teacher:      ObjectId → users (required)
title:        String (required)
description:  String
questions: [{
  question:      String (required)
  options:       [String] (required)
  correctAnswer: Number (index, required)
  points:        Number (default: 1)
}]
duration:     Number in minutes (default: 15)
passingScore: Number in % (default: 70)
status:       String enum ['pending','approved','rejected']
```

#### quizattempts
```js
studentId:      ObjectId → users (required)
quizId:         ObjectId → quizzes (required)
courseId:       ObjectId → courses (required)
answers:        [Number] (selected option indices)
score:          Number (points earned)
totalPoints:    Number (max possible)
percentage:     Number
passed:         Boolean
completionTime: Number in seconds
submittedAt:    Date
```

#### lessonprogresses
```js
studentId:   ObjectId → users (required)
lessonId:    ObjectId → lessons (required)
courseId:    ObjectId → courses (required)
completed:   Boolean (default: false)
completedAt: Date
timeSpent:   Number in seconds (default: 0)
```

#### certificates
```js
student:           ObjectId → users (required)
course:            ObjectId → courses (required)
quiz:              ObjectId → quizzes (required)
certificateNumber: String (required, unique) — e.g., CERT-2024-XXXXX
studentName:       String (denormalized)
courseName:        String (denormalized)
score:             Number
percentage:        Number
issuedDate:        Date
pdfPath:           String (local filesystem path)
```

#### payments
```js
student:         ObjectId → users (required)
course:          ObjectId → courses (required)
amount:          Number in NPR (required)
transactionId:   String (UUID v4, required, unique)
esewaRefId:      String (from eSewa callback)
status:          String enum ['pending','success','failed']
paymentMethod:   String (default: 'esewa')
instructorShare: Number in NPR (80% of amount)
platformFee:     Number in NPR (20% of amount)
instructor:      ObjectId → users (course teacher)
```

#### activities
```js
userId:       ObjectId → users (required)
activityType: String enum [
  'login','logout','enrollment','course_created','course_enrolled',
  'course_completed','course_completion','course_approved','course_rejected',
  'quiz_attempt','quiz_created','quiz_taken','quiz_passed','quiz_failed',
  'quiz_approved','quiz_rejected','quiz_completed','lesson_completed',
  'certificate_earned','enrollment_approved','enrollment_rejected',
  'instructor_eligible','instructor_promoted','promoted_to_instructor',
  'profile_updated'
]
description:  String (required)
metadata:     Mixed (arbitrary extra data)
// Index: { userId: 1, createdAt: -1 }
```

#### sessions *(future)*
```js
title:       String (required)
description: String
courseId:    ObjectId → courses
teacherId:   ObjectId → users (required)
scheduledAt: Date (required)
duration:    Number in minutes (default: 60)
meetingLink: String
status:      String enum ['scheduled','ongoing','completed','cancelled']
```

---

## 6. API Documentation

> Base URL: `http://localhost:5000/api`  
> Auth header: `Authorization: Bearer <jwt_token>`

### `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register with name, email, password, role |
| POST | `/login` | No | Login, returns token + user object |
| POST | `/logout` | No | Stateless logout (client clears token) |
| GET | `/me` | JWT | Returns current user with all fields |
| GET | `/google` | No | Redirect to Google OAuth consent screen |
| GET | `/google/callback` | No | OAuth callback → redirects to frontend |

### `/api/courses`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List all approved courses (public) |
| GET | `/:courseId` | No | Single approved course + lessons + quiz count |

### `/api/student`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/dashboard` | JWT | student | Dashboard: enrollments, available quizzes, progress |
| GET | `/courses` | JWT | student | Student's enrolled courses with status |
| POST | `/courses/:courseId/enroll` | JWT | student | Request enrollment in a course |
| GET | `/courses/:courseId/lessons` | JWT | student | Lessons with per-lesson completion status |
| POST | `/lessons/:lessonId/complete` | JWT | student | Mark lesson complete |
| GET | `/courses/:courseId/progress` | JWT | student | Course completion percentage |
| POST | `/quizzes/:quizId/submit` | JWT | — | Submit quiz answers → score + optional certificate |
| GET | `/quiz-results` | JWT | student | All quiz attempts with stats |
| PUT | `/request-promotion` | JWT | student | Self-request instructor promotion |
| GET | `/certificates` | JWT | student | List earned certificates |

### `/api/teacher`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/dashboard` | JWT | teacher/admin | Teacher stats, recent enrollments |
| GET | `/courses` | JWT | teacher/admin | Teacher's own courses |
| POST | `/courses` | JWT | teacher/admin | Create course (multipart: thumbnail image) |
| GET | `/courses/:courseId/lessons` | JWT | teacher/admin | Lessons for management view |
| POST | `/courses/:courseId/lessons` | JWT | teacher/admin | Create lesson (multipart: video upload) |
| PUT | `/lessons/:lessonId` | JWT | teacher/admin | Update lesson content/video |
| PATCH | `/lessons/:lessonId/cover` | JWT | teacher/admin | Upload lesson cover image |
| PATCH | `/lessons/:lessonId/pdf` | JWT | teacher/admin | Attach PDF to lesson |
| DELETE | `/lessons/:lessonId` | JWT | teacher/admin | Delete lesson |
| GET | `/quizzes` | JWT | teacher/admin | Teacher's quizzes |
| POST | `/quizzes` | JWT | teacher/admin | Create quiz with questions array |
| PUT | `/quizzes/:id` | JWT | teacher/admin | Update quiz (if not approved) |
| DELETE | `/quizzes/:id` | JWT | teacher/admin | Delete quiz |
| GET | `/reputation` | JWT | teacher/admin | Teacher impact/reputation score |

### `/api/admin`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/dashboard` | JWT | admin | Platform-wide stats |
| GET | `/students` | JWT | admin | All students list |
| POST | `/enroll` | JWT | admin | Manually enroll student in course |
| GET | `/courses` | JWT | admin | All courses with teacher info |
| GET | `/courses/pending` | JWT | admin | Pending courses for review |
| PATCH | `/courses/:courseId/approve` | JWT | admin | Approve or reject course |
| GET | `/quizzes/pending` | JWT | admin | Pending quizzes for review |
| PUT | `/quizzes/:quizId/approve` | JWT | admin | Approve or reject quiz |
| POST | `/create-teacher` | JWT | admin | Create teacher account |
| GET | `/instructor-eligible` | JWT | admin | Students meeting instructor criteria |
| PUT | `/promote-instructor/:userId` | JWT | admin | Promote student to teacher |
| PUT | `/reject-instructor/:userId` | JWT | admin | Reject instructor promotion |

### `/api/payments`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/esewa/initiate` | JWT | — | Initiate eSewa payment OR free enrollment |
| GET | `/esewa/success` | No | — | eSewa success callback (server-to-server) |
| GET | `/esewa/failure` | No | — | eSewa failure callback |
| GET | `/admin/logs` | JWT | admin | Payment history with optional `?status=` filter |

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/certificates/verify/:certNumber` | Public certificate lookup by number |
| GET | `/health` | Server health check |

---

## 7. Frontend Routes & Pages

### Public Pages (no login required)

| Route | Component | File |
|-------|-----------|------|
| `/` | LandingPage | `src/pages/LandingPage.tsx` |
| `/login` | Login | `src/pages/Login.tsx` |
| `/register` | Register | `src/pages/Register.tsx` |
| `/oauth-success` | OAuthSuccess | `src/pages/OAuthSuccess.tsx` |
| `/verify/:certNumber?` | VerifyCertificate | `src/pages/VerifyCertificate.tsx` |
| `/courses/:courseId` | CoursePreview | `src/pages/CoursePreview.tsx` |

### Authenticated — All Roles

| Route | Component | File |
|-------|-----------|------|
| `/profile` | Profile | `src/pages/Profile.tsx` |

### Student Pages (`allowedRoles: ['student']`)

| Route | Component | File |
|-------|-----------|------|
| `/student/home` | StudentHome | `src/pages/student/StudentHome.tsx` |
| `/student/dashboard` | StudentDashboard | `src/pages/student/StudentDashboard.tsx` |
| `/student/browse-courses` | BrowseCourses | `src/pages/student/BrowseCourses.tsx` |
| `/student/courses/:courseId` | CourseDetail | `src/pages/student/CourseDetail.tsx` |
| `/student/lessons/:lessonId` | LessonView | `src/pages/student/LessonView.tsx` |
| `/student/quizzes/:quizId/take` | TakeQuiz | `src/pages/student/TakeQuiz.tsx` |
| `/student/quiz-results` | QuizResults | `src/pages/student/QuizResults.tsx` |
| `/student/certificates` | Certificates | `src/pages/student/Certificates.tsx` |

### Teacher Pages (`allowedRoles: ['teacher']`)

| Route | Component | File |
|-------|-----------|------|
| `/teacher/dashboard` | TeacherDashboard | `src/pages/teacher/TeacherDashboard.tsx` |
| `/teacher/create-course` | CreateCourse | `src/pages/teacher/CreateCourse.tsx` |
| `/teacher/create-quiz` | CreateQuiz | `src/pages/teacher/CreateQuiz.tsx` |
| `/teacher/courses/:courseId/lessons` | ManageLessons | `src/pages/teacher/ManageLessons.tsx` |

### Admin Pages (`allowedRoles: ['admin']`)

| Route | Component | File |
|-------|-----------|------|
| `/admin/dashboard` | AdminDashboard | `src/pages/admin/AdminDashboard.tsx` |
| `/admin/enroll-student` | EnrollStudent | `src/pages/admin/EnrollStudent.tsx` |
| `/admin/course-approvals` | CourseApprovals | `src/pages/admin/CourseApprovals.tsx` |
| `/admin/quiz-approvals` | QuizApprovals | `src/pages/admin/QuizApprovals.tsx` |
| `/admin/instructor-eligibility` | InstructorEligibility | `src/pages/admin/InstructorEligibility.tsx` |
| `/admin/payments` | PaymentLogs | `src/pages/admin/PaymentLogs.tsx` |

### Shared Components

| Component | File | Used By |
|-----------|------|---------|
| ProfileDropdown | `src/components/common/ProfileDropdown.tsx` | All dashboards |
| ProtectedRoute | `src/components/ProtectedRoute.tsx` | App.tsx route guards |
| CoursesSection | `src/components/CoursesSection.tsx` | LandingPage |
| Navbar | `src/components/common/Navbar.tsx` | Legacy (replaced by DarkHeader) |

---

## 8. Recent Implementations

Listed in reverse chronological order (most recent first):

### eSewa Payment Integration *(latest)*
- **New:** `backend/src/models/Payment.js`
- **New:** `backend/src/services/paymentService.js` — initiate, verify, record enrollment
- **New:** `backend/src/controllers/paymentController.js`
- **New:** `backend/src/routes/paymentRoutes.js`
- **New:** `frontend/src/pages/admin/PaymentLogs.tsx`
- **Modified:** `backend/src/models/Course.js` — added `price`, `isFree` fields
- **Modified:** `frontend/src/pages/CoursePreview.tsx` — price display + eSewa form submit
- **Modified:** `frontend/src/pages/student/StudentHome.tsx` — payment result toast
- **Modified:** `frontend/src/pages/teacher/CreateCourse.tsx` — price input field
- **Modified:** `frontend/src/pages/admin/AdminDashboard.tsx` — Payment Logs action card
- **Modified:** `frontend/src/App.tsx` — `/admin/payments` route

### Course Preview & Student Home
- **New:** `frontend/src/pages/CoursePreview.tsx` — public `/courses/:id` page
- **New:** `frontend/src/pages/student/StudentHome.tsx` — post-login student landing
- **New:** `backend/src/controllers/courseController.js::getCourseById` — public single-course endpoint
- **Modified:** `backend/src/routes/courseRoutes.js` — added `GET /:courseId`
- **Modified:** `frontend/src/store/authStore.ts` — students now redirect to `/student/home`
- **Modified:** `frontend/src/pages/LandingPage.tsx` — course cards navigate to `/courses/:id`

### Profile Page & ProfileDropdown
- **New:** `frontend/src/pages/Profile.tsx` — user profile display
- **New:** `frontend/src/components/common/ProfileDropdown.tsx` — avatar dropdown with nav
- **Modified:** All 3 dashboards (Student, Teacher, Admin) — replaced name/logout with ProfileDropdown

### Dark Theme Rewrites
- **Modified:** `frontend/src/pages/student/BrowseCourses.tsx`
- **Modified:** `frontend/src/pages/student/TakeQuiz.tsx` — replaced `window.confirm` with inline modal
- **Modified:** `frontend/src/pages/student/QuizResults.tsx` — removed react-icons dependency
- All pages share design tokens: `BG='#0f1117'`, `CARD='#1a1d27'`, `ELEVATED='#1f2937'`, `BORDER='#2d3748'`

### Landing Page Dynamic Content
- **Modified:** `frontend/src/pages/LandingPage.tsx`
  - Fetches real courses from `/api/courses` (public, no auth)
  - Functional search with dropdown results (navbar + hero inputs)
  - Dynamic Tutorials dropdown from real course titles
  - Skeleton loading states
  - Fallback hardcoded cards when no courses exist

### Cloudinary Media Uploads
- **New:** `backend/src/config/cloudinary.js` — image/video/PDF upload middleware
- **Modified:** `backend/src/routes/teacherRoutes.js` — Cloudinary middleware on lesson/course endpoints
- **Modified:** `frontend/src/pages/teacher/ManageLessons.tsx` — video upload with progress bar
- **Modified:** `frontend/src/pages/teacher/CreateCourse.tsx` — thumbnail upload

---

## 9. Tech Stack & Dependencies

### Backend (`backend/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.19.2 | HTTP server framework |
| mongoose | ^8.7.0 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | JWT auth tokens |
| bcryptjs | ^2.4.3 | Password hashing |
| passport | ^0.7.0 | OAuth framework |
| passport-google-oauth20 | ^2.0.0 | Google OAuth 2.0 |
| cloudinary | ^1.41.3 | Media CDN API |
| multer | ^2.1.1 | Multipart file upload |
| multer-storage-cloudinary | ^4.0.0 | Multer → Cloudinary storage |
| nodemailer | ^8.0.4 | Email sending (Gmail SMTP) |
| pdfkit | ^0.18.0 | Certificate PDF generation |
| uuid | ^14.0.0 | UUID v4 for transaction IDs |
| axios | (implicit) | eSewa payment verification HTTP calls |
| cors | ^2.8.5 | Cross-origin request handling |
| dotenv | ^16.4.7 | Environment variable loading |
| cookie-parser | ^1.4.6 | Cookie parsing |
| nodemon | ^3.1.7 | Dev auto-restart (devDependency) |

### Frontend (`frontend/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | UI framework |
| react-dom | ^19.2.4 | DOM rendering |
| react-router-dom | ^7.13.2 | SPA routing |
| zustand | ^5.0.12 | Global state (auth) |
| axios | ^1.14.0 | HTTP client |
| react-hot-toast | ^2.6.0 | Toast notifications |
| react-icons | ^5.6.0 | Icon library |
| framer-motion | ^12.38.0 | Animations |
| date-fns | ^4.1.0 | Date formatting |
| tailwindcss | ^3.4.19 | Utility CSS |
| @tailwindcss/vite | ^4.2.2 | Tailwind Vite plugin |
| typescript | (devDep) | Type safety |
| vite | (devDep) | Build tool |

### External Services

| Service | Purpose | Config |
|---------|---------|--------|
| MongoDB | Database | `MONGODB_URI` |
| Google OAuth | Social login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Gmail SMTP | Certificate emails | `EMAIL_USER`, `EMAIL_PASSWORD` |
| Cloudinary | Media storage (images/videos/PDFs) | `CLOUDINARY_*` |
| eSewa (UAT) | Payment gateway | `ESEWA_MERCHANT_ID` |

---

## 10. Environment Configuration

### `backend/.env` — All Required Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/educity

# JWT
JWT_SECRET=<strong-random-string>
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email (Gmail SMTP — use App Password, not Gmail password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-gmail>@gmail.com
EMAIL_PASSWORD=<16-char-app-password>
EMAIL_FROM=EduCity LMS <your-gmail@gmail.com>

# eSewa Payment (UAT = test environment)
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_GATEWAY_URL=https://uat.esewa.com.np/epay/main
ESEWA_VERIFY_URL=https://uat.esewa.com.np/epay/transrec
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

### Frontend — No `.env` required locally
The Axios instance in `frontend/src/api/axios.ts` is hardcoded to `http://localhost:5000/api`.
For production, set `VITE_API_URL` and update the axios baseURL.

### CORS
Backend currently allows only `http://localhost:5173` (Vite default).
For production, update in `backend/src/app.js`:
```js
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
```

---

## 11. Known Issues & Incomplete Features

### Current Issues

| Issue | Location | Severity |
|-------|----------|----------|
| eSewa verification uses `axios.post` to eSewa's XML endpoint — no XML parser installed, relies on string `.includes()` which is fragile | `paymentService.js:verifyEsewaPayment()` | Medium |
| `certificates/` directory for PDF storage is local filesystem — not persistent in cloud deployment | `certificateService.js` | High (deploy) |
| Cloudinary env vars commented out in `.env` (active config uses hardcoded values in `cloudinary.js`) | `backend/.env` | Medium |
| eSewa success callback uses `oid` query param for `transactionId`, but eSewa may send `pid` instead — should be verified against eSewa docs | `paymentController.js:handleSuccessCallback` | Medium |
| `sessions` model exists but no routes, controller, or UI is implemented | `backend/src/models/Session.js` | Low |
| `GET /api/admin/test-email` endpoint is not defined in `adminRoutes.js` despite being referenced | `adminRoutes.js` | Low |
| Legacy `Navbar` component still exists but is being replaced by per-page `DarkHeader` | `components/common/Navbar.tsx` | Low |
| `BrowseCourses` page is now superseded by `StudentHome` for course discovery — may be redundant | `pages/student/BrowseCourses.tsx` | Low |

### Partially Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Activity logging | Schema + enum exists | `Activity.create()` calls exist in some controllers but not all — not shown in any UI |
| Teacher reputation score | Backend endpoint exists (`GET /teacher/reputation`) | Not prominently displayed in TeacherDashboard UI |
| `performanceMetrics.averageCompletionTime` | Calculated | Not displayed in student-facing UI |
| eSewa live production keys | UAT only | Switch `ESEWA_MERCHANT_ID` to production key |
| Admin user management (block/delete) | Backend endpoints exist | No frontend UI implemented for block/delete |
| Admin view all enrollments | `adminController.getAllEnrollments` exists | No dedicated frontend page |
| Session scheduling | Model exists | Zero implementation beyond schema |

### Missing Features

| Feature | Notes |
|---------|-------|
| Instructor payout system | `instructorShare` stored in Payment but no withdrawal/transfer flow |
| Course rating/reviews | No schema or UI |
| Discussion forums / Q&A | Not implemented |
| Mobile app | Web-only |
| Admin block/unblock user UI | Backend exists, no frontend page |
| Lesson video streaming (adaptive bitrate) | Currently direct Cloudinary URL — no HLS |
| Password reset / forgot password | Not implemented |
| Email verification on registration | Not implemented |
| Admin user management page | Backend endpoints exist, no frontend page |

---

## 12. Future Enhancements

### High Priority
1. **Move certificate PDFs to Cloudinary** — eliminate local filesystem dependency for cloud deployment
2. **Implement eSewa production keys** — switch from UAT to live gateway for real payments
3. **Add XML parsing for eSewa verification** — use `xml2js` or `fast-xml-parser` for robust callback handling
4. **Admin user management UI** — page to block/unblock/delete users, view all enrollments
5. **Password reset flow** — forgot password email with secure time-limited token

### Medium Priority
6. **Instructor payout system** — track and process 80% revenue share to instructors
7. **Live session scheduling** — use the `sessions` schema for Zoom/Google Meet integration
8. **Course ratings & reviews** — student feedback after completing a course
9. **Admin analytics dashboard** — revenue charts, enrollment trends, top courses
10. **Email notifications** — enrollment approved/rejected, quiz graded, new course available

### Lower Priority
11. **Discussion forums** — per-course Q&A between students and teachers
12. **Adaptive video streaming** — HLS encoding for better mobile video performance
13. **Bulk CSV enrollment** — admin upload CSV to enroll many students at once
14. **Multi-language support** — Nepali interface option (target market)
15. **Mobile PWA** — Progressive Web App manifest for installable mobile experience
16. **Course completion certificate variety** — different certificate templates by category
17. **Coupon/discount system** — promo codes for paid courses

---

*Document generated from full static analysis of `d:\educity` — 2026-04-28*
