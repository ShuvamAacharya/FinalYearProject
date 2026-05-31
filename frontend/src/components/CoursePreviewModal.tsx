import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuthStore } from '../store/authStore';

export interface PreviewCourse {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  students: number;
  lessons: number;
  image: string;
  level?: string;
  category?: string;
}

interface CoursePreviewModalProps {
  course: PreviewCourse | null;
  isOpen: boolean;
  onClose: () => void;
}

const PLACEHOLDER_GRADIENT = 'linear-gradient(135deg, #2563eb, #7c3aed)';

export default function CoursePreviewModal({
  course,
  isOpen,
  onClose,
}: CoursePreviewModalProps) {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [enrolling, setEnrolling] = useState(false);

  if (!course) return null;

  const handleEnroll = async () => {
    if (!token) {
      toast.error('Please log in to enroll');
      onClose();
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await axios.post(`/student/courses/${course._id}/enroll`);

      toast.success('Successfully enrolled! Admin will approve your enrollment soon.');
      onClose();

      setTimeout(() => {
        navigate('/student/home');
      }, 1500);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Enrollment failed';
      toast.error(errorMsg);
      console.error('Enrollment error:', error);
    } finally {
      setEnrolling(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal — centered via flex parent, no translate conflict with motion */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-preview-title"
            initial={{ scale: 0.9, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 24 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#1a1d27] border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
                aria-label="Close preview"
              >
                <X size={24} />
              </button>

              {/* Course image */}
              <div className="relative h-48 sm:h-64 overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: PLACEHOLDER_GRADIENT }}
                  >
                    <span className="text-6xl opacity-40">📚</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {course.category && (
                  <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs font-semibold mb-3">
                    {course.category}
                  </span>
                )}

                <h2 id="course-preview-title" className="text-2xl sm:text-3xl font-bold text-white mb-2 pr-10">
                  {course.title}
                </h2>

                <p className="text-gray-400 mb-4">
                  By{' '}
                  <span className="text-gray-300 font-semibold">{course.instructor}</span>
                  {course.level && (
                    <span className="ml-2 capitalize text-xs bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700 inline-block align-middle">
                      {course.level}
                    </span>
                  )}
                </p>

                <p className="text-gray-300 mb-6 leading-relaxed">{course.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{course.students}</div>
                    <div className="text-xs text-gray-400 mt-1">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{course.lessons}</div>
                    <div className="text-xs text-gray-400 mt-1">Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">4.5</div>
                    <div className="text-xs text-gray-400 mt-1">Rating</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="shrink-0">
                    <div className="text-gray-400 text-sm mb-1">Price</div>
                    <div className="text-3xl font-bold text-white">
                      {course.price === 0 ? (
                        <span className="text-green-400">Free</span>
                      ) : (
                        <>Rs. {course.price.toLocaleString()}</>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="flex-1 sm:flex-none sm:min-w-[200px] px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg transition transform hover:scale-[1.02] shadow-lg"
                  >
                    {enrolling ? 'Enrolling…' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
