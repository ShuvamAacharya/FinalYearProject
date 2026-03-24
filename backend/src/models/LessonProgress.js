// // import mongoose from 'mongoose';

// // const lessonProgressSchema = new mongoose.Schema(
// //   {
// //     studentId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true,
// //       index: true,
// //     },
// //     lessonId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'Lesson',
// //       required: true,
// //       index: true,
// //     },
// //     courseId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'Course',
// //       required: true,
// //       index: true,
// //     },
// //     completed: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     completedAt: {
// //       type: Date,
// //     },
// //     timeSpent: {
// //       type: Number, // in seconds
// //       default: 0,
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // // Compound index for unique student-lesson combination
// // lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

// // const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);

// // export default LessonProgress;


// import mongoose from 'mongoose';

// const lessonProgressSchema = new mongoose.Schema(
//   {
//     studentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },
//     lessonId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Lesson',
//       required: true,
//       index: true,
//     },
//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Course',
//       required: true,
//       index: true,
//     },
//     completed: {
//       type: Boolean,
//       default: false,
//     },
//     completedAt: {
//       type: Date,
//     },
//     timeSpent: {
//       type: Number, // in seconds
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Compound index for unique student-lesson combination
// lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

// const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);

// export default LessonProgress;


import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('LessonProgress', lessonProgressSchema);