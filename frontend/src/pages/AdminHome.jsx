import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FacultyDashboard from '../components/FacultyDashboard';
import ManageCourses from '../components/ManageCourses';

export default function AdminHome() {
  const [tab, setTab] = useState('dashboard');
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user.name}</h1>
        <button onClick={logout}>Log Out</button>
      </header>
      <nav className="tabs">
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Faculty Dashboard</button>
        <button className={tab === 'courses' ? 'active' : ''} onClick={() => setTab('courses')}>Manage Courses</button>
      </nav>
      {tab === 'dashboard' && <FacultyDashboard />}
      {tab === 'courses' && <ManageCourses />}
    </div>
  );
}
