import axiosInstance from '../api/axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CoursePreviewModal, { type PreviewCourse } from '../components/CoursePreviewModal';
import EnhancedNavbar from '../components/EnhancedNavbar';
import HeroSection from '../components/HeroSection';
import ExploreCoursesSection from '../components/ExploreCoursesSection';
import PopularCoursesSection from '../components/PopularCoursesSection';
import TestimonialsSection from '../components/TestimonialsSection';

const mapCourseToPreview = (course: {
  _id: string;
  title?: string;
  description?: string;
  teacher?: { name?: string };
  price?: number;
  enrollmentCount?: number;
  totalLessons?: number;
  thumbnail?: string;
  level?: string;
  category?: string;
}): PreviewCourse => ({
  _id: course._id,
  title: course.title || 'Untitled Course',
  description: course.description || 'Explore this course to learn from expert instructors.',
  instructor: course.teacher?.name || 'Instructor',
  price: course.price ?? 0,
  students: course.enrollmentCount ?? 0,
  lessons: course.totalLessons ?? 0,
  image: course.thumbnail || '',
  level: course.level,
  category: course.category,
});

// ── Component ──────────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthStore();

  const [courses, setCourses]             = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [previewCourse, setPreviewCourse] = useState<PreviewCourse | null>(null);
  const [showPreview, setShowPreview]     = useState(false);

  // Hydrate user from token, then redirect logged-in users away from landing.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) fetchUser();
  }, [user, fetchUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    const destination = user.role === 'student' ? '/student/dashboard' : `/${user.role}/dashboard`;
    navigate(destination);
  }, [user, navigate]);

  // Fetch public approved courses.
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get('/courses');
        setCourses(res.data.courses || res.data.data || []);
      } catch {
        console.error('Failed to fetch courses');
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleBrowseCourses = () => {
    navigate(user ? '/student/browse-courses' : '/login');
  };

  const handleSignIn = () => {
    const savedRole = localStorage.getItem('educity_role');
    navigate(savedRole ? `/login?role=${savedRole}` : '/login');
  };

  const openCoursePreview = (course: Parameters<typeof mapCourseToPreview>[0]) => {
    setPreviewCourse(mapCourseToPreview(course));
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <EnhancedNavbar
        user={user}
        courses={courses}
        onPreview={openCoursePreview}
        onBrowse={handleBrowseCourses}
        onSignIn={handleSignIn}
      />

      <HeroSection
        courses={courses}
        onPreview={openCoursePreview}
        onBrowse={handleBrowseCourses}
      />

      <ExploreCoursesSection
        courses={courses}
        loading={coursesLoading}
        onPreview={openCoursePreview}
        onBrowse={handleBrowseCourses}
      />

      <PopularCoursesSection onBrowse={handleBrowseCourses} />

      <TestimonialsSection />

      <CoursePreviewModal
        course={previewCourse}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />

      {/* ── Footer ── */}
      <footer className="bg-[#1a1d27] border-t border-gray-700 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li onClick={handleBrowseCourses} className="hover:text-white cursor-pointer">Browse Courses</li>
                <li onClick={() => navigate('/register')} className="hover:text-white cursor-pointer">Become Instructor</li>
                <li className="hover:text-white cursor-pointer">Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Learn</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li onClick={handleBrowseCourses} className="hover:text-white cursor-pointer">Tutorials</li>
                <li className="hover:text-white cursor-pointer">Blog</li>
                <li className="hover:text-white cursor-pointer">Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">Discord</li>
                <li className="hover:text-white cursor-pointer">Forum</li>
                <li className="hover:text-white cursor-pointer">Events</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">Privacy</li>
                <li className="hover:text-white cursor-pointer">Terms</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} EduCity. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
