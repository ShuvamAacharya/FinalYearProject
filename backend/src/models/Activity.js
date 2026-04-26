import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        'login',
        'logout',
        'enrollment',
        'course_created',
        'course_enrolled',
        'course_completed',
        'course_completion',
        'course_approved',
        'course_rejected',
        'quiz_attempt',
        'quiz_created',
        'quiz_taken',
        'quiz_passed',
        'quiz_failed',
        'quiz_approved',
        'quiz_rejected',
        'quiz_completed',
        'lesson_completed',
        'certificate_earned',
        'enrollment_approved',
        'enrollment_rejected',
        'instructor_eligible',
        'instructor_promoted',
        'promoted_to_instructor',
        'profile_updated',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ userId: 1, createdAt: -1 });
const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
