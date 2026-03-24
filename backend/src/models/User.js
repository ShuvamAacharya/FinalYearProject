import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,   // ← optional for Google OAuth users
      minlength: 6,
    },
    googleId: {          // ← new: links Google account
      type: String,
      unique: true,
      sparse: true,      // allows multiple null values
    },
    isGoogleUser: {      // ← new: helpful flag on frontend
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: function() {
        return `https://ui-avatars.com/api/?background=4F46E5&color=fff&name=${encodeURIComponent(this.name)}`;
      }
    },
    // Instructor Eligibility Fields
    instructorEligible: {
      type: Boolean,
      default: false,
    },
    instructorApproved: {
      type: Boolean,
      default: false,
    },
    teacherQualification: {
      type: String,
      default: '',
    },
    // Performance Metrics
    performanceMetrics: {
      totalQuizzesTaken: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      totalPointsEarned: {
        type: Number,
        default: 0,
      },
      averageCompletionTime: {
        type: Number,
        default: 0,
      },
    },
    // Dates
    promotedToInstructorAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving - skip if no password (Google OAuth users)
userSchema.pre('save', async function () {
  if (!this.password) return;          // ← skip for Google users
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password — safe for Google users
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;    // ← Google users have no password
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;