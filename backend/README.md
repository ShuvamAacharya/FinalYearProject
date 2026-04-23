# EduCity LMS — Backend

## Prerequisites
- Node.js v18+
- MongoDB running locally or Atlas URI

## Setup
1. Clone the repository
2. cd backend
3. npm install
4. cp .env.example .env
5. Fill in your values in .env
6. npm run dev

## API Base URL
http://localhost:5000/api

## Roles
- student: browse courses, request enrollment, take quizzes, earn certificates
- teacher: create courses, add lessons, create quizzes
- admin: approve courses, quizzes, enrollments, manage users

## Default Admin Account (after seed)
Email: admin@educity.com
Password: Admin@123
