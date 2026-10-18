import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SessionControl from '../components/SessionControl';
import CourseReport from '../components/CourseReport';

export default function LecturerHome() {
  const [tab, setTab] = useState('session');
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user.name}</h1>
        <button onClick={logout}>Log Out</button>
      </header>
      <nav className="tabs">
        <button className={tab === 'session' ? 'active' : ''} onClick={() => setTab('session')}>Session Control</button>
        <button className={tab === 'report' ? 'active' : ''} onClick={() => setTab('report')}>Course Report</button>
      </nav>
      {tab === 'session' && <SessionControl />}
      {tab === 'report' && <CourseReport />}
    </div>
  );
}
