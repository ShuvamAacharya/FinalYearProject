import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number, // index of correct option
    points: {
      type: Number,
      default: 1,
    },
  }],
  duration: Number, // in minutes
  passingScore: {
    type: Number,
    default: 70,
  },
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);