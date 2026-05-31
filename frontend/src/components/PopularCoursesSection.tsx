import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const POPULAR_COURSES = [
  {
    id: 1,
    title: 'Tech Interview 101 - DSA & System Design',
    icon: '💼',
    iconBg: 'bg-blue-600',
    rating: 4.9,
    difficulty: 'Beginner to Advanced',
    interested: '420K+',
    isLive: false,
  },
  {
    id: 2,
    title: 'Java Backend Development with AI - Live',
    icon: '☕',
    iconBg: 'bg-red-600',
    rating: 4.8,
    difficulty: 'Intermediate & Advanced',
    interested: '280K+',
    isLive: true,
  },
  {
    id: 3,
    title: 'Generative AI Training Program - Live',
    icon: '🤖',
    iconBg: 'bg-purple-600',
    rating: 4.9,
    difficulty: 'Beginner to Advanced',
    interested: '310K+',
    isLive: true,
  },
  {
    id: 4,
    title: 'Data Science & Machine Learning Bootcamp',
    icon: '📊',
    iconBg: 'bg-blue-700',
    rating: 4.7,
    difficulty: 'Beginner to Advanced',
    interested: '480K+',
    isLive: false,
  },
  {
    id: 5,
    title: 'Full Stack Web Development Masterclass',
    icon: '🌐',
    iconBg: 'bg-green-600',
    rating: 4.8,
    difficulty: 'Intermediate & Advanced',
    interested: '350K+',
    isLive: false,
  },
  {
    id: 6,
    title: 'System Design for Senior Engineers - Live',
    icon: '⚙️',
    iconBg: 'bg-purple-700',
    rating: 4.9,
    difficulty: 'Intermediate & Advanced',
    interested: '260K+',
    isLive: true,
  },
  {
    id: 7,
    title: 'Cloud Architecture Masterclass',
    icon: '☁️',
    iconBg: 'bg-cyan-600',
    rating: 4.8,
    difficulty: 'Advanced',
    interested: '200K+',
    isLive: false,
  },
];

interface PopularCoursesSectionProps {
  onBrowse: () => void;
}

export default function PopularCoursesSection({ onBrowse }: PopularCoursesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-[#0f1117] px-4 py-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-white">Popular Courses</h2>
          <div className="flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-[#1a1d27] border border-gray-700 rounded-lg hover:border-gray-500 transition text-white"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-[#1a1d27] border border-gray-700 rounded-lg hover:border-gray-500 transition text-white"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {POPULAR_COURSES.map((course) => (
            <div
              key={course.id}
              onClick={onBrowse}
              className="flex-shrink-0 w-72 bg-[#1a1d27] border border-gray-700 rounded-lg p-6 hover:border-gray-500 transition cursor-pointer transform hover:scale-105"
            >
              {course.isLive && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded tracking-wide">
                    LIVE COURSE
                  </span>
                </div>
              )}

              <div
                className={`w-16 h-16 ${course.iconBg} rounded-lg flex items-center justify-center text-3xl mb-4`}
              >
                {course.icon}
              </div>

              <div className="flex items-center gap-1 mb-3">
                <span className="text-yellow-400 text-sm font-semibold">★ {course.rating}</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem]">
                {course.title}
              </h3>

              <p className="text-sm text-gray-400 mb-4">{course.difficulty}</p>

              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <span>👥 {course.interested} interested</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
