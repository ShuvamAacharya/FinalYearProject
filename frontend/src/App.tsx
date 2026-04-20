import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Pages — Public
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthSuccess from './pages/OAuthSuccess';
import VerifyCertificate from './pages/VerifyCertificate';

// Pages — Student
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseCourses from './pages/student/BrowseCourses';
import CourseDetail from './pages/student/CourseDetail';
import LessonView from './pages/student/LessonView';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults';
import Certificates from './pages/student/Certificates';

// Pages — Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import CreateQuiz from './pages/teacher/CreateQuiz';
import ManageLessons from './pages/teacher/ManageLessons';

// Pages — Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import EnrollStudent from './pages/admin/EnrollStudent';
import CourseApprovals from './pages/admin/CourseApprovals';
import QuizApprovals from './pages/admin/QuizApprovals';
import InstructorEligibility from './pages/admin/InstructorEligibility';

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

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/browse-courses" element={<BrowseCourses />} />
          <Route path="/student/courses/:courseId" element={<CourseDetail />} />
          <Route path="/student/lessons/:lessonId" element={<LessonView />} />
          <Route path="/student/quizzes/:quizId/take" element={<TakeQuiz />} />
          <Route path="/student/quiz-results" element={<QuizResults />} />
          <Route path="/student/certificates" element={<Certificates />} />
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
          <Route path="/admin/enroll-student" element={<EnrollStudent />} />
          <Route path="/admin/course-approvals" element={<CourseApprovals />} />
          <Route path="/admin/quiz-approvals" element={<QuizApprovals />} />
          <Route path="/admin/instructor-eligibility" element={<InstructorEligibility />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;