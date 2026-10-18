import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CourseRegistration from '../components/CourseRegistration';
import ScanAttendance from '../components/ScanAttendance';
import MyAttendance from '../components/MyAttendance';

export default function StudentHome() {
  const [tab, setTab] = useState('scan');
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user.name}</h1>
        <button onClick={logout}>Log Out</button>
      </header>
      <nav className="tabs">
        <button className={tab === 'scan' ? 'active' : ''} onClick={() => setTab('scan')}>Scan Attendance</button>
        <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Register Courses</button>
        <button className={tab === 'attendance' ? 'active' : ''} onClick={() => setTab('attendance')}>My Attendance</button>
      </nav>
      {tab === 'scan' && <ScanAttendance />}
      {tab === 'register' && <CourseRegistration />}
      {tab === 'attendance' && <MyAttendance />}
    </div>
  );
}
