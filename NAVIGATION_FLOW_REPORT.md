# EduCity Navigation Flow Report
*Generated: 2026-04-29*

---

## 1. Route Configuration

### Frontend Routes (App.tsx)

| Path | Component | Protected? | Allowed Roles | Lazy? |
|------|-----------|------------|---------------|-------|
| `/` | LandingPage | No | — | No |
| `/login` | Login | No | — | No |
| `/register` | Register | No | — | No |
| `/oauth-success` | OAuthSuccess | No | — | No |
| `/verify/:certNumber?` | VerifyCertificate | No | — | No |
| `/courses/:courseId` | CoursePreview | No | — | No |
| `/profile` | Profile | Yes | student, teacher, admin | No |
| `/student/home` | StudentHome | Yes | student | No |
| `/student/dashboard` | StudentDashboard | Yes | student | No |
| `/student/browse-courses` | BrowseCourses | Yes | student | No |
| `/student/courses/:courseId` | CourseDetail | Yes | student | No |
| `/student/lessons/:lessonId` | LessonView | Yes | student | No |
| `/student/quizzes/:quizId/take` | TakeQuiz | Yes | student | No |
| `/student/quiz-results` | QuizResults | Yes | student | No |
| `/student/certificates` | Certificates | Yes | student | No |
| `/student/test-yourself` | TestYourself | Yes | student, teacher | No |
| `/student/general-quiz/:quizId` | TakeGeneralQuiz | Yes | student, teacher | No |
| `/student/quiz-history` | QuizHistory | Yes | student, teacher | No |
| `/teacher/dashboard` | TeacherDashboard | Yes | teacher | No |
| `/teacher/create-course` | CreateCourse | Yes | teacher | No |
| `/teacher/create-quiz` | CreateQuiz | Yes | teacher | No |
| `/teacher/courses/:courseId/lessons` | ManageLessons | Yes | teacher | No |
| `/admin/dashboard` | AdminDashboard | Yes | admin | No |
| `/admin/enroll-student` | EnrollStudent | Yes | admin | No |
| `/admin/course-approvals` | CourseApprovals | Yes | admin | No |
| `/admin/quiz-approvals` | QuizApprovals | Yes | admin | No |
| `/admin/instructor-eligibility` | InstructorEligibility | Yes | admin | No |
| `/admin/payments` | PaymentLogs | Yes | admin | No |

**Observations:**
- ✅ All student routes are under `/student/*`
- ✅ All teacher routes are under `/teacher/*`
- ✅ All admin routes are under `/admin/*`
- ✅ All ProtectedRoute wrappers have `allowedRoles` defined
- ❌ **No catch-all `<Route path="*">` at the end** — unknown URLs render a blank page

### All Page Files

**Public:**
- LandingPage.tsx, Login.tsx, Register.tsx, OAuthSuccess.tsx, VerifyCertificate.tsx, CoursePreview.tsx, Profile.tsx

**Student (student/):**
- StudentHome.tsx, StudentDashboard.tsx, BrowseCourses.tsx, CourseDetail.tsx, LessonView.tsx, TakeQuiz.tsx, QuizResults.tsx, Certificates.tsx, TestYourself.tsx, TakeGeneralQuiz.tsx, QuizHistory.tsx

**Teacher (teacher/):**
- TeacherDashboard.tsx, CreateCourse.tsx, CreateQuiz.tsx, ManageLessons.tsx

**Admin (admin/):**
- AdminDashboard.tsx, EnrollStudent.tsx, CourseApprovals.tsx, QuizApprovals.tsx, InstructorEligibility.tsx, PaymentLogs.tsx

**Count:** 28 pages total. All pages in App.tsx have corresponding files. ✅

### Backend API Routes (app.js)

| Mount Path | Route File | Notes |
|------------|------------|-------|
| `/api/auth` | authRoutes | Google OAuth passport configured |
| `/api/student` | studentRoutes | Mounted BEFORE certificate route |
| `/api/teacher` | teacherRoutes | — |
| `/api/admin` | adminRoutes | — |
| `/api/courses` | courseRoutes | Public GET, protected POST |
| `/api/payments` | paymentRoutes | eSewa UAT gateway |
| `/api/student/certificates` | certificateRoutes | Mounted after studentRoutes |
| `/api/general-quizzes` | generalQuizRoutes | ✅ Present |
| `/certificates` | static files | PDF downloads |
| `/api/certificates/verify/:certNumber` | inline handler | Public verification |

**CORS:** `origin: 'http://localhost:5173'`, `credentials: true` ✅  
**Passport:** `passport.initialize()` called ✅ (no `passport.session()` — correct for JWT)  
**Route ordering note:** `/api/student/certificates` is mounted after `/api/student`. Express falls through when studentRoutes has no matching sub-path, so certificates work. Non-critical, but mounting order is fragile.

---

## 2. Auth Store Navigation Logic

### Login Flow

```
authStore.login() — called from Login.tsx handleSubmit()
  → POST /api/auth/login
  → Save token to localStorage
  → set({ token, user, loading: false })
  → toast.success('Login successful!')
  → setTimeout(100ms):
      checks window.location.search for ?redirect= param
      if redirect exists → window.location.href = redirectTo
      else if student  → window.location.href = '/student/home'
      else if teacher  → window.location.href = '/teacher/dashboard'
      else if admin    → window.location.href = '/admin/dashboard'
```

**Navigation method:** `window.location.href` (hard page reload, not React Router navigate)  
**Redirect param support:** Yes — checks `?redirect=` in URL  
**Problem:** `Login.tsx` calls `authStore.login()` directly. Login component itself does no navigation — it's all inside authStore.

### Register Flow

```
Register.tsx handleSubmit()
  → authStore.register()
      → POST /api/auth/register
      → Save token to localStorage
      → set({ token, user })
      → toast.success(...)
      → window.location.href = '/student/home'  ← HARD REDIRECT (authStore)

  Also in Register.tsx (after await register()):
  → setTimeout(100ms): navigate('/student/dashboard')  ← DEAD CODE (page already reloaded)

  Also in Register.tsx useEffect on [user]:
  → navigate('/student/dashboard')  ← DEAD CODE (page already reloaded)
```

**Result:** `window.location.href` in authStore fires first, causing full reload. The `navigate()` calls in Register.tsx never execute. Student lands on `/student/home`.

### OAuth Flow

```
OAuthSuccess.tsx (mounted at /oauth-success)
  → reads ?token= and ?role= from URL
  → localStorage.setItem('token', token)
  → fetchUser() — updates Zustand store
  → if teacher → navigate('/teacher/dashboard')
  → if admin   → navigate('/admin/dashboard')
  → else       → navigate('/student/dashboard')  ← students go here
```

**Student OAuth destination:** `/student/dashboard` (differs from password login → `/student/home`)

### fetchUser Flow

```
Called in: App.tsx useEffect (on token change), ProtectedRoute useEffect (on mount)
  → GET /api/auth/me
  → set({ user: data.user })
  → On error: removes token, set({ token: null, user: null })
  → Does NOT navigate anywhere
```

### Initial State

```typescript
user:  null
token: localStorage.getItem('token')  // could be non-null on page load
loading: false
```

ProtectedRoute handles the case where `token` exists but `user` is null (still fetching) by showing a loading spinner. This is correct. ✅

---

## 3. Role-Based Redirects

### Expected Behavior (from spec)
| Role | Should Go To |
|------|-------------|
| student | `/student/home` |
| teacher | `/teacher/dashboard` |
| admin | `/admin/dashboard` |

### Actual Behavior Per Entry Point

| Entry Point | Student → | Teacher → | Admin → |
|-------------|-----------|-----------|---------|
| `authStore.login()` | `/student/home` ✅ | `/teacher/dashboard` ✅ | `/admin/dashboard` ✅ |
| `authStore.register()` | `/student/home` ✅ | `/teacher/dashboard` ✅ | `/admin/dashboard` ✅ |
| `OAuthSuccess.tsx` | `/student/dashboard` ⚠️ | `/teacher/dashboard` ✅ | `/admin/dashboard` ✅ |
| `Register.tsx` useEffect | `/student/dashboard` ⚠️ | `/teacher/dashboard` ✅ | `/admin/dashboard` ✅ |
| `LandingPage.tsx` redirect | `/student/dashboard` ⚠️ | `/teacher/dashboard` ✅ | `/admin/dashboard` ✅ |
| `ProtectedRoute` wrong-role | `/student/home` ✅ | `/teacher/dashboard` ✅ | `/admin/dashboard` ✅ |

### Mismatches Found

**Students only** have a split-destination problem:
- Password login → `/student/home` (StudentHome — the "welcome" page)
- OAuth login → `/student/dashboard` (StudentDashboard — the metrics page)
- LandingPage logged-in redirect → `/student/dashboard`

Both `/student/home` and `/student/dashboard` are valid, defined routes — so nothing is broken outright. But the student experience is inconsistent depending on how they log in.

---

## 4. Broken Imports

**AuthContext imports:** Zero files found. ✅ All authentication uses Zustand (`useAuthStore`). No legacy Context API remnants.

**AuthProvider in main.tsx:** Not present. ✅ Only `<BrowserRouter>` and `<StrictMode>` wrap the app.

---

## 5. Missing Routes

All routes referenced in navigation code exist in App.tsx. No dangling references found. ✅

```
authStore → /student/home         ✅ defined
authStore → /teacher/dashboard    ✅ defined
authStore → /admin/dashboard      ✅ defined
OAuthSuccess → /student/dashboard ✅ defined
LandingPage → /${role}/dashboard  ✅ defined for all three roles
handleBrowseCourses → /student/browse-courses ✅ defined
ProtectedRoute → /student/home    ✅ defined
```

---

## 6. Navigation Loops Detected

**Potential loop — LandingPage ↔ Dashboard:**

LandingPage has this useEffect:
```typescript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token || !user) return;
  navigate(`/${user.role}/dashboard`);  // redirects logged-in users away
}, [user, navigate]);
```

This fires when `user` becomes available. While `token` exists but `user` is null (fetchUser() in progress), it does NOT redirect. Once `user` is set, it redirects to dashboard. No loop possible since dashboard pages don't redirect back to `/`. ✅

**Potential loop — ProtectedRoute → Login → ProtectedRoute:**

`ProtectedRoute` redirects unauthenticated users to `/login` (no ?redirect= param appended).  
`Login.tsx` calls `authStore.login()` which checks `window.location.search` for `?redirect=`.  
Since ProtectedRoute never adds `?redirect=`, the redirect-after-login feature is **silently broken** — it never activates. After login, users always go to their default dashboard, never back to the page they tried to visit.

No infinite loop, but the "return to attempted page" UX is broken.

---

## 7. Critical Issues (Priority Order)

### BLOCKER (Prevents login/navigation)
*None.* All routes exist, all redirects reach valid destinations.

### HIGH (Degrades user experience)

**1. Demo login password is wrong**  
**Location:** [Login.tsx:138](frontend/src/pages/Login.tsx#L138)  
**Issue:** Quick-login buttons fill password as `Student@123`. Admin password was changed to `Admin@1234`. The teacher/student demo accounts may also not exist or use different passwords.  
**Fix:** Update demo password to match actual test account credentials, or remove demo buttons.

**2. Triple navigation in Register.tsx**  
**Location:** [Register.tsx:39-53](frontend/src/pages/Register.tsx#L39) and [Register.tsx:28-34](frontend/src/pages/Register.tsx#L28)  
**Issue:** `authStore.register()` calls `window.location.href` (hard reload). Register.tsx also calls `navigate()` in a setTimeout AND in a useEffect — both fire after authStore's hard redirect and are dead code. The destinations also differ: authStore sends student to `/student/home`, but Register.tsx navigates to `/student/dashboard`.  
**Fix:** Remove the `navigate()` calls from Register.tsx entirely. authStore already handles navigation.

**3. ProtectedRoute does not preserve redirect URL**  
**Location:** [ProtectedRoute.tsx:18-19](frontend/src/components/ProtectedRoute.tsx#L18)  
**Issue:** `<Navigate to="/login" replace />` loses the page the user tried to visit. authStore.login() checks for `?redirect=` but ProtectedRoute never adds it.  
**Fix:**
```typescript
// In ProtectedRoute.tsx
import { useLocation } from 'react-router-dom';
const location = useLocation();
return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
```

**4. Inconsistent student landing page**  
**Location:** authStore.ts vs OAuthSuccess.tsx vs LandingPage.tsx  
**Issue:** Password login → `/student/home`. OAuth login → `/student/dashboard`. LandingPage (already logged in) → `/student/dashboard`. Students end up on different pages depending on login method.  
**Fix:** Pick one canonical student home (`/student/home`) and align all entry points to use it.

### MEDIUM (Minor issues)

**5. No catch-all 404 route**  
**Location:** [App.tsx](frontend/src/App.tsx) — end of Routes block  
**Issue:** Navigating to an undefined path (typo, stale bookmark) renders a blank page.  
**Fix:** Add `<Route path="*" element={<Navigate to="/" replace />} />` as the last route.

**6. LandingPage uses hardcoded axios URL**  
**Location:** [LandingPage.tsx:91](frontend/src/pages/LandingPage.tsx#L91)  
**Issue:** `axios.get('http://localhost:5000/api/courses')` — raw URL, not the configured axios instance. Breaks in staging/production.  
**Fix:** Import `axios from '../api/axios'` and use `axios.get('/courses')`.

---

## 8. Recommended Fixes (In Order)

1. **Align student OAuth redirect** — change OAuthSuccess.tsx L28 from `/student/dashboard` to `/student/home`
2. **Remove dead navigate() calls from Register.tsx** — delete useEffect (L28-34) and setTimeout navigate (L41-48)
3. **Fix ProtectedRoute to append ?redirect=** — preserve the attempted URL on login redirect
4. **Fix LandingPage logged-in redirect** — change `/${user.role}/dashboard` to `/student/home` for students
5. **Add catch-all route** — add `<Route path="*" element={<Navigate to="/" replace />} />` at end of App.tsx
6. **Fix LandingPage hardcoded axios URL** — use the configured axios instance

---

## 9. Next Actions

### IMMEDIATE (Fix inconsistencies):
- [ ] [OAuthSuccess.tsx:28](frontend/src/pages/OAuthSuccess.tsx#L28) — change `/student/dashboard` → `/student/home`
- [ ] [Register.tsx:28-34](frontend/src/pages/Register.tsx#L28) — remove the useEffect navigation block
- [ ] [Register.tsx:41-48](frontend/src/pages/Register.tsx#L41) — remove the setTimeout navigate block
- [ ] [LandingPage.tsx:84](frontend/src/pages/LandingPage.tsx#L84) — change redirect to use `/student/home` for students
- [ ] [App.tsx](frontend/src/App.tsx) — add catch-all `<Route path="*">` at end of Routes

### AFTER IMMEDIATE FIXES:
- [ ] Test password login for all three roles
- [ ] Test Google OAuth login as student
- [ ] Test direct URL access while logged out (verify ?redirect= works)
- [ ] Test LandingPage redirect for already-logged-in user
- [ ] Verify unknown URL (e.g. `/foobar`) shows landing page, not blank

### LOWER PRIORITY:
- [ ] [LandingPage.tsx:91](frontend/src/pages/LandingPage.tsx#L91) — fix hardcoded axios URL
- [ ] [ProtectedRoute.tsx:18](frontend/src/components/ProtectedRoute.tsx#L18) — add ?redirect= param
- [ ] Demo login buttons — verify or remove (student/teacher demo accounts may not exist)
