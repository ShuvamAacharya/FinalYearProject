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
      default: null,
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
      type: Number,
      required: true,
      default: 15,
    },
    passingScore: {
      type: Number,
      required: true,
      default: 70,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isGeneral: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['HTML', 'CSS', 'JavaScript', 'Python', 'General', 'Math', 'Science'],
      default: 'General',
    },
    creditPoints: { type: Number, default: 10 },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);