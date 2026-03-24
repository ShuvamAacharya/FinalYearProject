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
      required: [true, 'Please add a category'],
      enum: ['Web Development', 'Mobile Development', 'Data Science', 'Design', 'Business', 'Other'],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    thumbnail: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=Course+Thumbnail',
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
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('Course', courseSchema);