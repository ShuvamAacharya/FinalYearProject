const TESTIMONIALS = [
  {
    name: 'John Doe',
    initials: 'JD',
    color: 'bg-blue-600',
    achievement:
      'Got promoted to Senior Dev position after completing the Full Stack Development course and building portfolio projects.',
  },
  {
    name: 'Sarah Smith',
    initials: 'SS',
    color: 'bg-green-600',
    achievement:
      'Completed 5 courses and earned certificates in Design & Machine Learning. Now working as an ML Engineer.',
  },
  {
    name: 'Mike Johnson',
    initials: 'MJ',
    color: 'bg-orange-600',
    achievement:
      'Started my own freelance business after mastering Web Development, DevOps and Linux courses. Earning 2x salary.',
  },
];

export default function TestimonialsSection() {
  return (
    <div className="bg-[#0f1117] px-4 py-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-12">
          What Subscribers Are Achieving Through Learning
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.initials}
              className="bg-[#1a1d27] border border-gray-700 rounded-lg p-8 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}
                >
                  {t.initials}
                </div>
                <h3 className="font-bold text-white text-lg">{t.name}</h3>
              </div>

              <p className="text-gray-300 leading-relaxed">{t.achievement}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
