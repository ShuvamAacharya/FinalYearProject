import LiveCourseSearch from './LiveCourseSearch';

const CATEGORY_PILLS = ['DSA Online', 'DS, ML & AI', 'LLD & HLD'];

const CATEGORY_NAV = [
  'DSA',
  'Practice Problems',
  'C',
  'C++',
  'Java',
  'Python',
  'JavaScript',
  'Data Science',
  'Machine Learning',
  'Linux',
  'DevOps',
];

interface HeroSectionProps {
  courses: any[];
  onPreview: (course: any) => void;
  onBrowse: () => void;
}

export default function HeroSection({ courses, onPreview, onBrowse }: HeroSectionProps) {
  return (
    <div className="bg-[#0f1117] pt-24 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
        {/* Left Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Hello, What Do You
              <br />
              Want To <span className="text-blue-400">Learn?</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Learn from expert-curated courses and tutorials
            </p>
          </div>

          {/* Search Bar */}
          <LiveCourseSearch
            courses={courses}
            onPreview={onPreview}
            onSubmit={onBrowse}
            size="lg"
            placeholder="Search for topics, courses, tutorials..."
          />

          {/* Category Pills */}
          <div className="flex flex-wrap gap-3">
            {CATEGORY_PILLS.map((pill) => (
              <button
                key={pill}
                onClick={onBrowse}
                className="px-4 py-2 bg-[#1a1d27] border border-gray-700 rounded-full text-white hover:border-green-500 hover:bg-green-500/10 transition font-semibold text-sm"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Right Illustration */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-gray-800">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-20" />

            {/* Floating shapes simulating a 3D illustration */}
            <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl -rotate-12 opacity-80 shadow-2xl flex items-center justify-center text-4xl">
              💻
            </div>
            <div className="absolute top-32 left-10 w-40 h-40 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl rotate-12 opacity-70 shadow-2xl flex items-center justify-center text-4xl">
              🐍
            </div>
            <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full opacity-75 shadow-2xl flex items-center justify-center text-3xl">
              📊
            </div>
            <div className="absolute bottom-10 left-20 w-24 h-24 bg-green-500 rounded-2xl opacity-70 shadow-2xl flex items-center justify-center text-3xl">
              ⚡
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-white opacity-90">
                <div className="text-2xl font-bold drop-shadow-lg">Learn Anything</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Scrollbar */}
      <div className="max-w-7xl mx-auto mt-4 pb-8 border-b border-gray-700">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORY_NAV.map((cat, i) => (
            <button
              key={cat}
              onClick={onBrowse}
              className={`px-4 py-2 rounded-full border transition whitespace-nowrap text-sm font-medium ${
                i === 0
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-[#1a1d27] border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
