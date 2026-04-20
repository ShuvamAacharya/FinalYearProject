import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';

const BrowseCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

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
    } catch (error) {
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

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Courses</h1>
          
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 max-w-md"
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course._id} className="card hover:shadow-xl transition">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded capitalize">
                    {course.level}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <img
                    src={course.teacher.avatar}
                    alt={course.teacher.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{course.teacher.name}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {course.duration} hours</span>
                  <span>👥 {course.enrollmentCount} students</span>
                </div>

                {enrollmentMap[course._id] === 'pending' && (
                  <button disabled className="btn-primary w-full opacity-60 cursor-not-allowed">
                    ⏳ Pending Approval
                  </button>
                )}
                {enrollmentMap[course._id] === 'approved' && (
                  <Link to={`/student/courses/${course._id}`} className="btn-primary w-full text-center block">
                    Start Learning →
                  </Link>
                )}
                {enrollmentMap[course._id] === 'rejected' && (
                  <button onClick={() => handleEnroll(course._id)} className="btn-primary w-full">
                    Re-request Enrollment
                  </button>
                )}
                {!enrollmentMap[course._id] && (
                  <button onClick={() => handleEnroll(course._id)} className="btn-primary w-full">
                    Enroll Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCourses;