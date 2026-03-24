import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import './RoleSelectionModal.css';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleSelectionModal = ({ isOpen, onClose }: RoleSelectionModalProps) => {
  const navigate = useNavigate();
  const [rememberChoice, setRememberChoice] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    if (rememberChoice) {
      localStorage.setItem('educity_role', role);
    }
    navigate(`/login?role=${role}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>

        {/* Header */}
        <div className="modal-header">
          <h2>How would you like to continue?</h2>
          <p className="modal-subtext">
            Choose your role to access your personalized learning experience on EduCity.
          </p>
        </div>

        {/* Instruction */}
        <p className="modal-instruction">Please select your role</p>

        {/* Role Cards */}
        <div className="role-cards">
          {/* Student Card */}
          <div 
            className="role-card student-card"
            onClick={() => handleRoleSelect('student')}
          >
            <div className="role-illustration">
              <div className="student-avatar">
                <div className="avatar-head"></div>
                <div className="avatar-body"></div>
                <div className="book-icon">📚</div>
              </div>
            </div>
            <h3>Login as Student</h3>
            <p>Access courses, track progress, and earn certificates</p>
          </div>

          {/* Instructor Card */}
          <div 
            className="role-card instructor-card"
            onClick={() => handleRoleSelect('teacher')}
          >
            <div className="role-illustration">
              <div className="instructor-avatar">
                <div className="avatar-head"></div>
                <div className="avatar-body"></div>
                <div className="teach-icon">👨‍🏫</div>
              </div>
            </div>
            <h3>Login as Instructor</h3>
            <p>Create courses, manage students, and share knowledge</p>
          </div>
        </div>

        {/* Remember Choice */}
        <div className="modal-footer">
          <label className="remember-checkbox">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
            />
            <span>Remember my choice next time</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;