import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';

const EnrollStudent = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching students and courses...');
      
      const [studentsRes, coursesRes] = await Promise.all([
        axios.get('/admin/students'),
        axios.get('/admin/courses'),
      ]);

      console.log('Students response:', studentsRes.data);
      console.log('Courses response:', coursesRes.data);

      const studentsList = studentsRes.data.students || [];
      const coursesList = coursesRes.data.courses || [];

      setStudents(studentsList);
      
      // Filter only approved courses
      const approvedCourses = coursesList.filter((c: any) => c.status === 'approved');
      setCourses(approvedCourses);

      console.log('Students loaded:', studentsList.length);
      console.log('Approved courses loaded:', approvedCourses.length);

      if (studentsList.length === 0) {
        toast.error('No students found');
      }

      if (approvedCourses.length === 0) {
        toast.error('No approved courses found');
      }

    } catch (error: any) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setDataLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error('Please select both student and course');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post('/admin/enroll', {
        studentId: selectedStudent,
        courseId: selectedCourse,
      });

      console.log('Enrollment response:', data);

      toast.success('Student enrolled successfully! 🎉');
      setSelectedStudent('');
      setSelectedCourse('');
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Enroll Student in Course</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Select Student */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="">-- Choose a student --</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {students.length} student{students.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Select Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="">-- Choose a course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} - {course.category}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {courses.length} approved course{courses.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Enroll Button */}
            <button
              onClick={handleEnroll}
              disabled={loading || !selectedStudent || !selectedCourse}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-lg"
            >
              {loading ? 'Enrolling...' : '✅ Enroll Student'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Total Students</h3>
              <p className="text-3xl font-bold text-blue-600">{students.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Approved Courses</h3>
              <p className="text-3xl font-bold text-green-600">{courses.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollStudent;