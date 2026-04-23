import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CoursesSection from '../components/CoursesSection';

// ── Icons ──────────────────────────────────────────────────────────────────

const SearchIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
  </svg>
);

const HamburgerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── Nav data ───────────────────────────────────────────────────────────────

const navItems = [
  {
    label: 'Courses',
    items: [
      { label: 'DSA / Placements',        href: '/student/browse-courses' },
      { label: 'Web Development',          href: '/student/browse-courses' },
      { label: 'Data Science / ML',        href: '/student/browse-courses' },
      { label: 'Cloud / DevOps',           href: '/student/browse-courses' },
      { label: 'Programming Languages',    href: '/student/browse-courses' },
      { label: 'All Courses',              href: '/student/browse-courses', dividerBefore: true },
    ],
  },
  {
    label: 'Tutorials',
    items: [
      { label: 'Introduction to JavaScript', href: '/student/browse-courses' },
      { label: 'Python Basics',              href: '/student/browse-courses' },
      { label: 'Data Structures',            href: '/student/browse-courses' },
      { label: 'Web Dev Fundamentals',       href: '/student/browse-courses' },
    ],
  },
];

const secondaryLinks = [
  'DSA', 'Practice Problems', 'C', 'C++', 'Java', 'Python',
  'JavaScript', 'Data Science', 'Machine Learning', 'Linux', 'DevOps',
];

// ── Component ──────────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthStore();

  const [heroSearch, setHeroSearch]       = useState('');
  const [openDropdown, setOpenDropdown]   = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) fetchUser();
  }, [user, fetchUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    navigate(`/${user.role}/dashboard`);
  }, [user, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLoginClick = () => {
    const savedRole = localStorage.getItem('educity_role');
    navigate(savedRole ? `/login?role=${savedRole}` : '/login');
  };

  const handleBrowseCourses = () => {
    setOpenDropdown(null);
    navigate(user ? '/student/browse-courses' : '/login');
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Primary Navbar ── */}
      <nav ref={navRef} className="sticky top-0 z-50" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-14">

            {/* Logo + name */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-base leading-none">E</span>
              </div>
              <span className="text-white font-semibold text-base">EduCity</span>
            </div>

            {/* Search bar — hidden on small screens */}
            <div className="relative hidden sm:block w-64 lg:w-72">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full rounded-full px-4 py-1.5 text-sm text-gray-300 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500"
                style={{ backgroundColor: '#2d2d2d', border: '1px solid #3d3d3d' }}
              />
            </div>

            {/* Center nav spacer + desktop dropdowns */}
            <div className="flex-1" />

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((nav) => {
                const isOpen = openDropdown === nav.label;
                return (
                  <div className="relative" key={nav.label}>
                    <button
                      onClick={() => toggleDropdown(nav.label)}
                      aria-expanded={isOpen}
                      aria-controls={`dropdown-${nav.label}`}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                        isOpen
                          ? 'text-green-400 border-b-2 border-green-400'
                          : 'text-gray-200 hover:text-white border-b-2 border-transparent'
                      }`}
                    >
                      {nav.label}
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 200ms ease',
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Desktop dropdown panel */}
                    <div
                      id={`dropdown-${nav.label}`}
                      role="menu"
                      className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden"
                      style={{
                        background: '#1f2937',
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
                        transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                        pointerEvents: isOpen ? 'auto' : 'none',
                      }}
                    >
                      {nav.items.map((item) => (
                        <div key={item.label}>
                          {'dividerBefore' in item && item.dividerBefore && (
                            <div className="border-t border-gray-600 my-1" />
                          )}
                          <button
                            role="menuitem"
                            onClick={handleBrowseCourses}
                            className="block w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors duration-150"
                          >
                            {item.label}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex-1" />

            {/* Right side — Sign In / Dashboard + mobile hamburger */}
            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <button
                  onClick={() => navigate(`/${user.role}/dashboard`)}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold text-green-400 hover:bg-green-500 hover:text-white transition-colors"
                  style={{ border: '1px solid #22c55e' }}
                >
                  Sign In
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden text-gray-300 hover:text-white transition-colors p-1"
                onClick={() => { setMobileMenuOpen((v) => !v); setOpenDropdown(null); }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: mobileMenuOpen ? '600px' : '0px',
            backgroundColor: '#1a1a1a',
            borderTop: mobileMenuOpen ? '1px solid #2d2d2d' : 'none',
          }}
        >
          <div className="px-4 py-2 pb-4 space-y-1">
            {navItems.map((nav) => {
              const isOpen = openDropdown === nav.label;
              return (
                <div key={nav.label}>
                  <button
                    onClick={() => toggleDropdown(nav.label)}
                    aria-expanded={isOpen}
                    aria-controls={`mobile-dropdown-${nav.label}`}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isOpen ? 'text-green-400 bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {nav.label}
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms ease',
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Mobile inline dropdown */}
                  <div
                    id={`mobile-dropdown-${nav.label}`}
                    role="menu"
                    className="overflow-hidden transition-all duration-300 pl-3"
                    style={{ maxHeight: isOpen ? '400px' : '0px' }}
                  >
                    {nav.items.map((item) => (
                      <div key={item.label}>
                        {'dividerBefore' in item && item.dividerBefore && (
                          <div className="border-t border-gray-700 my-1 ml-2" />
                        )}
                        <button
                          role="menuitem"
                          onClick={() => { handleBrowseCourses(); setMobileMenuOpen(false); }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-150"
                        >
                          {item.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Secondary pill bar ── */}
      <div
        className="sticky top-14 z-40 overflow-x-auto no-scrollbar"
        style={{ backgroundColor: '#252525' }}
      >
        <div className="flex items-center gap-0 px-4 sm:px-8 whitespace-nowrap min-w-max">
          {secondaryLinks.map((link, i) => (
            <button
              key={link}
              className="text-sm text-gray-400 hover:text-green-400 transition-colors px-4 py-2.5 font-medium"
              style={{ borderRight: i < secondaryLinks.length - 1 ? '1px solid #333' : 'none' }}
            >
              {link}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-grow">

        {/* ── Hero Section ── */}
        <section className="py-16 md:py-24" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Hello, What Do You Want To Learn?
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Learn from expert-curated courses and tutorials
            </p>

            <div className="relative max-w-xl mx-auto mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search for topics, courses, tutorials..."
                className="w-full rounded-full py-3 pl-12 pr-6 text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                style={{ backgroundColor: '#2d2d2d', border: '1px solid #3d3d3d' }}
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleBrowseCourses}
                className="rounded-full px-6 py-2 text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                DSA Online
              </button>
              <button
                onClick={handleBrowseCourses}
                className="rounded-full px-6 py-2 text-sm font-semibold text-gray-300 hover:border-green-400 hover:text-green-400 transition-colors"
                style={{ border: '1px solid #4b5563' }}
              >
                DS, ML &amp; AI
              </button>
              <button
                onClick={handleBrowseCourses}
                className="rounded-full px-6 py-2 text-sm font-semibold text-gray-300 hover:border-green-400 hover:text-green-400 transition-colors"
                style={{ border: '1px solid #4b5563' }}
              >
                LLD &amp; HLD
              </button>
            </div>
          </div>
        </section>

        {/* ── Explore Section ── */}
        <section className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#1e1e1e' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Explore</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={handleBrowseCourses}
                className="rounded-2xl p-8 text-left min-h-[220px] flex flex-col hover:scale-105 transition-transform duration-200 focus:outline-none"
                style={{ background: 'linear-gradient(135deg, #1a3a5c, #1e5f8e)' }}
              >
                <h3 className="text-white text-2xl font-bold">Data Structures &amp; Algorithms</h3>
                <p className="text-blue-200 text-sm mt-2">Master the fundamentals of DSA</p>
                <span className="mt-auto self-start rounded-full px-5 py-2 text-sm font-semibold text-white border border-white hover:bg-white hover:text-blue-900 transition-colors">
                  View Courses →
                </span>
              </button>
              <button
                onClick={handleBrowseCourses}
                className="rounded-2xl p-8 text-left min-h-[220px] flex flex-col hover:scale-105 transition-transform duration-200 focus:outline-none"
                style={{ background: 'linear-gradient(135deg, #5c1a3a, #8e1e5f)' }}
              >
                <h3 className="text-white text-2xl font-bold">Web Development</h3>
                <p className="text-pink-200 text-sm mt-2">Build modern web applications</p>
                <span className="mt-auto self-start rounded-full px-5 py-2 text-sm font-semibold text-white border border-white hover:bg-white hover:text-pink-900 transition-colors">
                  View Courses →
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ── Courses Section ── */}
        <CoursesSection onBrowse={handleBrowseCourses} />

      </main>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid #2d2d2d' }} className="py-8 text-center">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} EduCity Platform. Powered by Student Excellence.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
