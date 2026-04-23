import { useNavigate } from 'react-router-dom';

const StarIcon = () => (
  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const LevelIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface Course {
  id: number;
  title: string;
  level: string;
  rating: number;
  interested: string;
  live: boolean;
  gradient: string;
  icon: string;
  iconBg: string;
}

const courses: Course[] = [
  {
    id: 1,
    title: 'Tech Interview 101 – DSA and System Design',
    level: 'Beginner to Advanced',
    rating: 4.9,
    interested: '420k+',
    live: false,
    gradient: 'linear-gradient(135deg, #0a4d4d 0%, #0d7a7a 100%)',
    icon: '💻',
    iconBg: 'rgba(255,255,255,0.10)',
  },
  {
    id: 2,
    title: 'Java Backend Development with AI – Live',
    level: 'Intermediate and Advanced',
    rating: 4.8,
    interested: '280k+',
    live: true,
    gradient: 'linear-gradient(135deg, #4a0e2d 0%, #8b1a5e 100%)',
    icon: '☕',
    iconBg: 'rgba(255,255,255,0.10)',
  },
  {
    id: 3,
    title: 'Generative AI Training Program – Live',
    level: 'Beginner to Advanced',
    rating: 4.9,
    interested: '310k+',
    live: true,
    gradient: 'linear-gradient(135deg, #2d1b69 0%, #6d28d9 100%)',
    icon: '🤖',
    iconBg: 'rgba(255,255,255,0.10)',
  },
  {
    id: 4,
    title: 'Data Science & Machine Learning Bootcamp',
    level: 'Beginner to Advanced',
    rating: 4.7,
    interested: '195k+',
    live: false,
    gradient: 'linear-gradient(135deg, #0a3d62 0%, #1565c0 100%)',
    icon: '📊',
    iconBg: 'rgba(255,255,255,0.10)',
  },
  {
    id: 5,
    title: 'Full Stack Web Development Masterclass',
    level: 'Beginner to Advanced',
    rating: 4.8,
    interested: '340k+',
    live: false,
    gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    icon: '🌐',
    iconBg: 'rgba(255,255,255,0.10)',
  },
  {
    id: 6,
    title: 'System Design for Senior Engineers – Live',
    level: 'Intermediate and Advanced',
    rating: 4.9,
    interested: '160k+',
    live: true,
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
    icon: '⚙️',
    iconBg: 'rgba(255,255,255,0.10)',
  },
];

interface CoursesSectionProps {
  onBrowse?: () => void;
}

const CoursesSection = ({ onBrowse }: CoursesSectionProps) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    if (onBrowse) {
      onBrowse();
    } else {
      navigate('/student/browse-courses');
    }
  };

  return (
    <section
      className="py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#0b0f1a', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Courses</h2>
          <button
            onClick={handleExplore}
            className="rounded-full px-5 py-1.5 text-sm font-semibold text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
            style={{ border: '1px solid #374151' }}
          >
            View All
          </button>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="course-card rounded-2xl overflow-hidden cursor-pointer"
              style={{
                backgroundColor: '#111827',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onClick={handleExplore}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.55)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
              }}
            >
              {/* ── Gradient header ── */}
              <div
                className="relative flex items-end px-5 pb-4 pt-3"
                style={{
                  background: course.gradient,
                  minHeight: '130px',
                }}
              >
                {/* LIVE badge — top left */}
                {course.live && (
                  <span
                    className="absolute top-3 left-4 text-white text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: '#dc2626', letterSpacing: '0.06em' }}
                  >
                    LIVE COURSE
                  </span>
                )}

                {/* Rating badge — top right */}
                <span
                  className="absolute top-3 right-4 flex items-center gap-1 text-xs font-semibold text-white px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                >
                  <StarIcon />
                  {course.rating}
                </span>

                {/* Course icon */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
                  style={{ backgroundColor: course.iconBg }}
                >
                  {course.icon}
                </div>
              </div>

              {/* ── Card body ── */}
              <div className="px-5 pt-4 pb-4">
                {/* Title */}
                <h3
                  className="text-white font-semibold leading-snug line-clamp-2 mb-2"
                  style={{ fontSize: '15px' }}
                >
                  {course.title}
                </h3>

                {/* Level */}
                <div className="flex items-center gap-1.5 mb-4">
                  <LevelIcon />
                  <span className="text-xs text-gray-500">{course.level}</span>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid #1f2937', marginBottom: '12px' }} />

                {/* Bottom metadata row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UsersIcon />
                    <span className="text-xs text-gray-500">
                      {course.interested} interested
                    </span>
                  </div>
                  <button
                    className="text-xs font-semibold text-green-400 hover:text-green-300 hover:underline transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleExplore(); }}
                  >
                    Explore now →
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
