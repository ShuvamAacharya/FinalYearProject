import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

interface LiveCourseSearchProps {
  courses: any[];
  onPreview: (course: any) => void;
  onSubmit?: (query: string) => void;
  size?: 'sm' | 'lg';
  placeholder?: string;
}

/**
 * Reusable search input with a live results dropdown.
 * Filters the provided courses by title, category, or instructor name.
 */
export default function LiveCourseSearch({
  courses,
  onPreview,
  onSubmit,
  size = 'sm',
  placeholder = 'Search courses, topics, tutorials...',
}: LiveCourseSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? courses
        .filter((c) => {
          const q = query.toLowerCase();
          return (
            c.title?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.teacher?.name?.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = () => {
    if (query.trim() && onSubmit) onSubmit(query.trim());
  };

  const isLg = size === 'lg';

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className={`w-full bg-[#1a1d27] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition ${
          isLg ? 'px-6 py-4 pr-12 text-base' : 'px-4 py-2 pr-10 text-sm'
        }`}
      />
      <Search
        size={isLg ? 20 : 18}
        onClick={handleSubmit}
        className={`absolute text-gray-500 hover:text-gray-300 cursor-pointer ${
          isLg ? 'right-4 top-4' : 'right-3 top-2.5'
        }`}
      />

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-50 overflow-hidden bg-[#1f2937] border border-gray-700 text-left">
          {results.map((c) => (
            <button
              key={c._id}
              onClick={() => {
                setOpen(false);
                setQuery('');
                onPreview(c);
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
            >
              <Search size={15} className="text-gray-500 shrink-0" />
              <div className="overflow-hidden">
                <p className="truncate">{c.title}</p>
                {c.category && (
                  <p className="text-xs text-gray-500 truncate">{c.category}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
