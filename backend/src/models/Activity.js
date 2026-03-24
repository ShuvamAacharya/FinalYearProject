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
        'course_created',
        'course_enrolled',
        'course_completed',
        'quiz_created',           // ADD THIS
        'quiz_taken',
        'quiz_passed',
        'quiz_failed',
        'quiz_approved',          // ADD THIS
        'quiz_rejected',          // ADD THIS
        'quiz_completed',  // Make sure this is here
        'lesson_completed',
        'certificate_earned',
        'instructor_eligible',    // ADD THIS
        'promoted_to_instructor', // ADD THIS
        'profile_updated',
      ],
      // required: true,
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
    timestamps: true 
  }
);


// Index for faster queries
activitySchema.index({ userId: 1, createdAt: -1 });
const Activity = mongoose.model('Activity', activitySchema);
export default Activity;








// import mongoose from 'mongoose';

// const activitySchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     activityType: {
//       type: String,
//       required: true,
//       enum: [
//         'course_enrolled',
//         'lesson_completed',
//         'quiz_completed',
//         'course_completed',
//         'certificate_earned',
//       ],
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     metadata: {
//       type: mongoose.Schema.Types.Mixed,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model('Activity', activitySchema);