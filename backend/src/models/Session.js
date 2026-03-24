import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a session title'],
    },
    description: {
      type: String,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Please add a scheduled date'],
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    meetingLink: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('Session', sessionSchema);