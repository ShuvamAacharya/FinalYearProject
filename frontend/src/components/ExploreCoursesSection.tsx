import { ArrowRight } from 'lucide-react';

const GRADIENTS = [
  'from-blue-600 to-blue-800',
  'from-fuchsia-600 to-pink-600',
  'from-emerald-600 to-green-700',
  'from-amber-700 to-yellow-700',
];

const FALLBACK_COURSES = [
  {
    _id: 'fb-1',
    title: 'Data Structures & Algorithms',
    description: 'Master the fundamentals of DSA and ace technical interviews.',
    category: 'DSA',
    teacher: { name: 'Teacher Demo' },
    level: 'Beginner',
  },
  {
    _id: 'fb-2',
    title: 'Business Fundamentals for Beginners',
    description: 'Learn core principles of business, entrepreneurship, marketing and finance.',
    category: 'GENERAL',
    teacher: { name: 'Teacher Demo' },
    level: 'Beginner',
  },
  {
    _id: 'fb-3',
    title: 'Introduction to JavaScript',
    description: 'Learn JS fundamentals and build interactive web pages.',
    category: 'WEB DEVELOPMENT',
    teacher: { name: 'Teacher Demo' },
    level: 'Beginner',
  },
  {
    _id: 'fb-4',
    title: 'Web Development Basics',
    description: 'HTML, CSS and the foundations of the modern web.',
    category: 'WEB DEVELOPMENT',
    teacher: { name: 'Teacher Demo' },
    level: 'Beginner',
  },
];

interface ExploreCoursesSectionProps {
  courses: any[];
  loading: boolean;
  onPreview: (course: any) => void;
  onBrowse: () => void;
}

export default function ExploreCoursesSection({
  courses,
  loading,
  onPreview,
  onBrowse,
}: ExploreCoursesSectionProps) {
  const featured = (courses.length > 0 ? courses : FALLBACK_COURSES).slice(0, 4);

  return (
    <div className="bg-[#0f1117] px-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Explore Courses</h2>
            <p className="text-gray-400">
              Browse our instructor-created, admin-approved courses
            </p>
          </div>
          <button
            onClick={onBrowse}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition shrink-0"
          >
            View All <ArrowRight size={18} />
          </button>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1a1d27] rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((course, index) => (
              <div
                key={course._id}
                onClick={() => onPreview(course)}
                className={`bg-gradient-to-br ${
                  GRADIENTS[index % GRADIENTS.length]
                } rounded-lg p-6 cursor-pointer transform transition hover:scale-105 hover:shadow-2xl border border-transparent hover:border-white/30 group flex flex-col`}
              >
                <div className="flex-1">
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                    {course.category || 'General'}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-3 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="my-6 border-t border-white/20" />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/80">
                    <div>by {course.teacher?.name || 'Instructor'}</div>
                    {course.level && (
                      <div className="text-xs opacity-70 capitalize">{course.level}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(course);
                    }}
                    className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition group-hover:translate-x-1 group-hover:-translate-y-1"
                  >
                    <ArrowRight size={20} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
