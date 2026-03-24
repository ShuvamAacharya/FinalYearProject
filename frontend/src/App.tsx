import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import CreateQuiz from './pages/teacher/CreateQuiz';
import QuizApprovals from './pages/admin/QuizApprovals';
import CourseApprovals from './pages/admin/CourseApprovals';


// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseCourses from './pages/student/BrowseCourses';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorEligibility from './pages/admin/InstructorEligibility';
import ProtectedRoute from './components/ProtectedRoute';
import ManageLessons from './pages/teacher/ManageLessons';
import CourseDetail from './pages/student/CourseDetail';
import LessonView from './pages/student/LessonView';
import OAuthSuccess from './pages/OAuthSuccess';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults';

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

        {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses/:courseId" element={<CourseDetail />} />
            <Route path="/student/lessons/:lessonId" element={<LessonView />} />
            <Route path="/student/quizzes/:quizId/take" element={<TakeQuiz />} />
            <Route path="/student/quiz-results" element={<QuizResults />} />

        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses/:courseId/lessons" element={<ManageLessons />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;