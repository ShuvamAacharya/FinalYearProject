// import mongoose from 'mongoose';

// const quizSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Course',
//       required: true,
//     },
//     teacherId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     questions: [
//       {
//         question: String,
//         options: [String],
//         correctAnswer: Number,
//         points: {
//           type: Number,
//           default: 1,
//         },
//       },
//     ],
//     duration: {
//       type: Number,
//       required: true,
//     },
//     passingScore: {
//       type: Number,
//       default: 70,
//     },
//     // Quiz Approval System
//     status: {
//       type: String,
//       enum: ['pending', 'approved', 'rejected'],
//       default: 'pending', // Changed from 'approved' to 'pending'
//     },
//     approvedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     approvedAt: {
//       type: Date,
//     },
//     rejectionReason: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Quiz = mongoose.model('Quiz', quizSchema);

// export default Quiz;


import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: Number, // Index of correct answer (0, 1, 2, 3)
    required: true,
  },
  points: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    questions: [questionSchema],
    duration: {
      type: Number, // in minutes
      required: true,
      default: 15,
    },
    passingScore: {
      type: Number, // percentage
      required: true,
      default: 70,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);