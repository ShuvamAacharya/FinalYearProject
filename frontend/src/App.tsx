import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Pages — Public
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthSuccess from './pages/OAuthSuccess';
import VerifyCertificate from './pages/VerifyCertificate';
import Profile from './pages/Profile';
import CoursePreview from './pages/CoursePreview';

// Pages — Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentHome from './pages/student/StudentHome';
import BrowseCourses from './pages/student/BrowseCourses';
import CourseDetail from './pages/student/CourseDetail';
import LessonView from './pages/student/LessonView';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults';
import Certificates from './pages/student/Certificates';
import TestYourself from './pages/student/TestYourself';
import TakeGeneralQuiz from './pages/student/TakeGeneralQuiz';
import QuizHistory from './pages/student/QuizHistory';

// Pages — Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import CreateQuiz from './pages/teacher/CreateQuiz';
import ManageLessons from './pages/teacher/ManageLessons';

// Pages — Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import EnrollmentRequests from './pages/admin/EnrollmentRequests';
import CourseApprovals from './pages/admin/CourseApprovals';
import QuizApprovals from './pages/admin/QuizApprovals';
import InstructorEligibility from './pages/admin/InstructorEligibility';
import PaymentLogs from './pages/admin/PaymentLogs';

// Pages — GTA
import GTADashboard from './pages/gta/GTADashboard';

import ProtectedRoute from './components/ProtectedRoute';


function App() {
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  return (
    <>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* OAuth callback — public, no role guard */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/verify/:certNumber?" element={<VerifyCertificate />} />
        <Route path="/courses/:courseId" element={<CoursePreview />} />

        {/* Profile — all authenticated roles */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'gta', 'teacher', 'admin']} />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Student Routes — also accessible by gta role */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'gta']} />}>
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/browse-courses" element={<BrowseCourses />} />
          <Route path="/student/courses/:courseId" element={<CourseDetail />} />
          <Route path="/student/lessons/:lessonId" element={<LessonView />} />
          <Route path="/student/quizzes/:quizId/take" element={<TakeQuiz />} />
          <Route path="/student/quiz-results" element={<QuizResults />} />
          <Route path="/student/certificates" element={<Certificates />} />
        </Route>

        {/* General Quiz Routes — students, gta, and teachers */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'gta', 'teacher']} />}>
          <Route path="/student/test-yourself" element={<TestYourself />} />
          <Route path="/student/quizzes" element={<TestYourself />} />
          <Route path="/student/general-quiz/:quizId" element={<TakeGeneralQuiz />} />
          <Route path="/student/quiz-history" element={<QuizHistory />} />
        </Route>

        {/* GTA Routes */}
        <Route element={<ProtectedRoute allowedRoles={['gta']} />}>
          <Route path="/gta/contributions" element={<GTADashboard />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/create-course" element={<CreateCourse />} />
          <Route path="/teacher/create-quiz" element={<CreateQuiz />} />
          <Route path="/teacher/courses/:courseId/lessons" element={<ManageLessons />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/enrollment-requests" element={<EnrollmentRequests />} />
          <Route path="/admin/enroll-student" element={<Navigate to="/admin/enrollment-requests" replace />} />
          <Route path="/admin/course-approvals" element={<CourseApprovals />} />
          <Route path="/admin/quiz-approvals" element={<QuizApprovals />} />
          <Route path="/admin/instructor-eligibility" element={<InstructorEligibility />} />
          <Route path="/admin/payments" element={<PaymentLogs />} />
        </Route>

        {/* Catch-all — redirect unknown paths to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;