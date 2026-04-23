import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Course from './src/models/Course.js';
import Lesson from './src/models/Lesson.js';
import Quiz from './src/models/Quiz.js';
import Enrollment from './src/models/Enrollment.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/educity';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  console.log('Warning: clearing existing User, Course, Lesson, Quiz, Enrollment data...');
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    Enrollment.deleteMany({}),
  ]);

  // Users — passwords hashed by pre-save hook
  const [admin, teacher, student] = await Promise.all([
    User.create({ name: 'Admin', email: 'admin@educity.com', password: 'Admin@123', role: 'admin' }),
    User.create({ name: 'Teacher Demo', email: 'teacher@educity.com', password: 'Teacher@123', role: 'teacher' }),
    User.create({ name: 'Student Demo', email: 'student@educity.com', password: 'Student@123', role: 'student' }),
  ]);

  // Courses
  const [course1, course2] = await Promise.all([
    Course.create({
      title: 'Introduction to JavaScript',
      description: 'Learn JS fundamentals',
      teacher: teacher._id,
      category: 'Web Development',
      level: 'beginner',
      duration: 10,
      status: 'approved',
    }),
    Course.create({
      title: 'Web Development Basics',
      description: 'HTML, CSS and the web',
      teacher: teacher._id,
      category: 'Web Development',
      level: 'beginner',
      duration: 8,
      status: 'approved',
    }),
  ]);

  // Lessons — 2 per course
  await Promise.all([
    Lesson.create({ courseId: course1._id, title: 'Getting Started', content: 'Introduction to JavaScript and setting up your environment.', duration: 15, order: 1 }),
    Lesson.create({ courseId: course1._id, title: 'Core Concepts', content: 'Variables, functions, and control flow in JavaScript.', duration: 20, order: 2 }),
    Lesson.create({ courseId: course2._id, title: 'Getting Started', content: 'Introduction to HTML and how the web works.', duration: 15, order: 1 }),
    Lesson.create({ courseId: course2._id, title: 'Core Concepts', content: 'CSS styling, the box model, and basic layouts.', duration: 20, order: 2 }),
  ]);

  // Quizzes — 1 per course
  await Promise.all([
    Quiz.create({
      course: course1._id,
      teacher: teacher._id,
      title: 'JS Basics Quiz',
      passingScore: 60,
      duration: 15,
      status: 'approved',
      questions: [
        { question: 'What is JavaScript?', options: ['A language', 'A framework', 'A database', 'An OS'], correctAnswer: 0 },
        { question: 'Which keyword declares a variable?', options: ['var', 'int', 'dim', 'let it'], correctAnswer: 0 },
        { question: 'What does DOM stand for?', options: ['Document Object Model', 'Data Object Map', 'Dynamic Output Mode', 'None'], correctAnswer: 0 },
      ],
    }),
    Quiz.create({
      course: course2._id,
      teacher: teacher._id,
      title: 'Web Basics Quiz',
      passingScore: 60,
      duration: 15,
      status: 'approved',
      questions: [
        { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperText Modern Links', 'None'], correctAnswer: 0 },
        { question: 'Which tag creates a link?', options: ['<a>', '<link>', '<href>', '<url>'], correctAnswer: 0 },
        { question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style System', 'Creative Style Sheets', 'None'], correctAnswer: 0 },
      ],
    }),
  ]);

  // Enrollment — student in course1, approved
  await Enrollment.create({
    student: student._id,
    course: course1._id,
    status: 'approved',
    progress: 0,
    enrolledAt: new Date(),
  });

  console.log('\nSeed complete:');
  console.log('- 3 users created');
  console.log('- 2 courses created');
  console.log('- 4 lessons created');
  console.log('- 2 quizzes created');
  console.log('- 1 enrollment created');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
