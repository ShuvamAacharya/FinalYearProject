import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a course description'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      default: 'General',
      enum: ['General', 'Programming', 'Data Science', 'Web Development', 'Mobile', 'DevOps', 'Design', 'Business', 'Other'],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'pending',
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // in hours
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true
  }
);

courseSchema.pre('save', function (next) {
  this.isFree = this.price === 0;
  next();
});

export default mongoose.model('Course', courseSchema);