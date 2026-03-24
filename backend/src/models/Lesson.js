// // // import mongoose from 'mongoose';

// // // const lessonSchema = new mongoose.Schema({
// // //   title: {
// // //     type: String,
// // //     required: true,
// // //   },
// // //   content: String,
// // //   videoUrl: String,
// // //   duration: Number, // in minutes
// // //   order: {
// // //     type: Number,
// // //     required: true,
// // //   },
// // //   courseId: {
// // //     type: mongoose.Schema.Types.ObjectId,
// // //     ref: 'Course',
// // //     required: true,
// // //   },
// // // }, { timestamps: true });

// // // export default mongoose.model('Lesson', lessonSchema);



// // import mongoose from 'mongoose';

// // const lessonSchema = new mongoose.Schema(
// //   {
// //     courseId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'Course',
// //       required: true,
// //       index: true,
// //     },
// //     title: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },
// //     content: {
// //       type: String,
// //       required: true,
// //     },
// //     videoUrl: {
// //       type: String,
// //       default: '',
// //     },
// //     order: {
// //       type: Number,
// //       required: true,
// //       default: 1,
// //     },
// //     duration: {
// //       type: Number, // in minutes
// //       default: 10,
// //     },
// //     status: {
// //       type: String,
// //       enum: ['active', 'draft'],
// //       default: 'active',
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // // Index for faster queries
// // lessonSchema.index({ courseId: 1, order: 1 });

// // const Lesson = mongoose.model('Lesson', lessonSchema);

// // export default Lesson;


// import mongoose from 'mongoose';

// const lessonSchema = new mongoose.Schema(
//   {
//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Course',
//       required: true,
//       index: true,
//     },
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     content: {
//       type: String,
//       required: true,
//     },
//     videoUrl: {
//       type: String,
//       default: '',
//     },
//     order: {
//       type: Number,
//       required: true,
//       default: 1,
//     },
//     duration: {
//       type: Number, // in minutes
//       default: 10,
//     },
//     status: {
//       type: String,
//       enum: ['active', 'draft'],
//       default: 'active',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Index for faster queries
// lessonSchema.index({ courseId: 1, order: 1 });

// const Lesson = mongoose.model('Lesson', lessonSchema);

// export default Lesson;


import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', lessonSchema);