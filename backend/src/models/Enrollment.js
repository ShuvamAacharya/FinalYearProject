import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    progress: {
      type: Number,
      default: 0, // percentage
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true 
  }
);

enrollmentSchema.index({ student: 1, course: 1 });

export default mongoose.model('Enrollment', enrollmentSchema);