import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import ProfileDropdown from '../../components/common/ProfileDropdown';
import PageHeader from '../../components/ui/PageHeader';
import { BookOpen, Clock, Users } from 'lucide-react';

const BG      = '#0f1117';
const CARD    = '#1a1d27';
const BORDER  = '#2d3748';

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
  </svg>
);

const DarkHeader = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 px-6 py-4" style={{ backgroundColor: CARD, borderBottom: `1px solid ${BORDER}` }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm leading-none">E</span>
        </div>
        <span className="text-white font-semibold text-base">EduCity</span>
      </div>
      {user && (
        <ProfileDropdown
          user={{ name: user.name, role: user.role, email: user.email }}
          onLogout={onLogout}
        />
      )}
    </div>
  </header>
);

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
    <div className="h-44 bg-gray-700/40" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-700/50" />
        <div className="h-5 w-20 rounded-full bg-gray-700/50" />
      </div>
      <div className="h-5 w-3/4 rounded bg-gray-700/50" />
      <div className="h-4 w-full rounded bg-gray-700/40" />
      <div className="h-4 w-5/6 rounded bg-gray-700/40" />
      <div className="h-9 w-full rounded-lg bg-gray-700/40 mt-2" />
    </div>
  </div>
);

const statusBadge: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pending Approval',   cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  approved: { label: 'Enrolled',           cls: 'bg-green-500/10  text-green-400  border-green-500/30'  },
  rejected: { label: 'Enrollment Rejected', cls: 'bg-red-500/10   text-red-400    border-red-500/30'    },
};

const BrowseCourses = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [courses, setCourses]           = useState<any[]>([]);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>({});
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        axios.get('/courses'),
        axios.get('/student/courses'),
      ]);
      setCourses(coursesRes.data.courses);
      const map: Record<string, string> = {};
      enrollmentsRes.data.enrollments.forEach((e: any) => {
        const id = e.course?._id || e.course;
        if (id) map[id.toString()] = e.status;
      });
      setEnrollmentMap(map);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const { data } = await axios.post(`/student/courses/${courseId}/enroll`);
      toast.success(data.message || 'Enrollment request submitted!');
      setEnrollmentMap((prev) => ({ ...prev, [courseId]: 'pending' }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DarkHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <PageHeader
          title="Browse Courses"
          subtitle="Discover and enroll in instructor-led courses"
          showBack
          backTo="/student/dashboard"
        />

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 transition-all"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
          />
        </div>

        {/* Course grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={48} className="text-gray-600 mb-4 mx-auto" />
            <p className="text-gray-300 font-medium text-lg">No courses found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const status = enrollmentMap[course._id];
              return (
                <div
                  key={course._id}
                  className="rounded-2xl flex flex-col overflow-hidden transition-shadow hover:shadow-xl hover:shadow-black/30"
                  style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
                >
                  {/* Thumbnail */}
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center" style={{ backgroundColor: '#1f2937' }}>
                      <BookOpen size={40} className="text-gray-600" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {course.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full border" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.3)' }}>
                          {course.category}
                        </span>
                      )}
                      {course.level && (
                        <span className="text-xs px-2 py-0.5 rounded-full border capitalize" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#4ade80', borderColor: 'rgba(34,197,94,0.25)' }}>
                          {course.level}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{course.description}</p>

                    {/* Teacher */}
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                      {course.teacher?.avatar ? (
                        <img src={course.teacher.avatar} alt={course.teacher.name} className="w-5 h-5 rounded-full" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {course.teacher?.name?.[0]?.toUpperCase() ?? 'T'}
                        </div>
                      )}
                      <span>{course.teacher?.name ?? 'Instructor'}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      {course.duration != null && <span className="flex items-center gap-1"><Clock size={12} />{course.duration}h</span>}
                      {course.enrollmentCount != null && <span className="flex items-center gap-1"><Users size={12} />{course.enrollmentCount} students</span>}
                    </div>

                    {/* CTA */}
                    {status === 'pending' && (
                      <div className={`w-full text-center text-sm py-2 px-4 rounded-lg border ${statusBadge.pending.cls}`}>
                        {statusBadge.pending.label}
                      </div>
                    )}
                    {status === 'approved' && (
                      <Link
                        to={`/student/courses/${course._id}`}
                        className="w-full text-center text-sm py-2 px-4 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors block"
                      >
                        Start Learning →
                      </Link>
                    )}
                    {(status === 'rejected' || !status) && (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        className="w-full text-sm py-2 px-4 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        {status === 'rejected' ? 'Re-request Enrollment' : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCourses;
