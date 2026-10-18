// Run with: npm run seed
// This populates a fresh database with the sample dataset described in Section 4.2.1

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Registration = require('../models/Registration');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const AnalyticsSummary = require('../models/AnalyticsSummary');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding data...');

  await Promise.all([
    User.deleteMany({}), Course.deleteMany({}), Registration.deleteMany({}),
    Session.deleteMany({}), Attendance.deleteMany({}), AnalyticsSummary.deleteMany({}),
  ]);

  await Course.insertMany([
    { courseCode: 'CSC 111', title: 'Introduction to Computer Science', units: 3, level: 100, semester: 1, department: 'Shared', isFacultyWide: true },
    { courseCode: 'CSC 311', title: 'Design and Analysis of Algorithms', units: 3, level: 300, semester: 1, department: 'CS', isFacultyWide: false },
    { courseCode: 'CYB 311', title: 'Network Security', units: 3, level: 300, semester: 1, department: 'CyberSec', isFacultyWide: false },
  ]);

  const admin = await User.create({
    name: 'System Administrator', email: 'admin@example.com', password: 'ChangeMe123!', role: 'admin',
  });

  const lecturer = await User.create({
    name: 'Dr. Jane Lecturer', email: 'lecturer@example.com', password: 'ChangeMe123!', role: 'lecturer',
  });

  const students = [];
  for (let i = 1; i <= 8; i++) {
    students.push({
      name: `Student ${i}`, email: `student${i}@example.com`, password: 'ChangeMe123!',
      role: 'student', department: 'CS', level: 300, matricNo: `CSC/300/00${i}`,
    });
  }
  await User.create(students);

  console.log('Seed complete.');
  console.log(`Admin login: admin@example.com / ChangeMe123!`);
  console.log(`Lecturer login: lecturer@example.com / ChangeMe123!`);
  console.log(`Student logins: student1@example.com ... student8@example.com / ChangeMe123!`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
