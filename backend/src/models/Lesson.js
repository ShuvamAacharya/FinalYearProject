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
    type: {
      type: String,
      enum: ['video', 'article', 'mixed'],
      default: 'article',
    },
    content: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    pdfPublicId: {
      type: String,
      default: '',
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
