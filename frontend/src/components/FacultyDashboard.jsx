import { useEffect, useState } from 'react';
import api from '../services/api';

export default function FacultyDashboard() {
  const [records, setRecords] = useState([]);
  const [deptFilter, setDeptFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');

  useEffect(() => {
    api.get('/analytics/faculty').then((res) => setRecords(res.data)).catch(() => {});
  }, []);

  const filtered = records.filter((r) => {
    const deptMatch = deptFilter === 'All' || r.studentId?.department === deptFilter;
    const levelMatch = levelFilter === 'All' || r.studentId?.level === Number(levelFilter);
    return deptMatch && levelMatch;
  });

  const atRiskCount = filtered.filter((r) => r.atRisk).length;

  return (
    <div className="card">
      <h2>Faculty-Wide Attendance Dashboard</h2>
      <div className="filters">
        <label>Department
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option>All</option>
            <option value="CS">Computer Science</option>
            <option value="CyberSec">Cyber Security</option>
            <option value="IT">Information Technology</option>
          </select>
        </label>
        <label>Level
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option>All</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
          </select>
        </label>
      </div>
      <p><strong>{atRiskCount}</strong> student-course records currently flagged at-risk (below 75%).</p>
      <table>
        <thead>
          <tr><th>Student</th><th>Dept</th><th>Level</th><th>Course</th><th>%</th><th>Status</th></tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r._id}>
              <td>{r.studentId?.name}</td>
              <td>{r.studentId?.department}</td>
              <td>{r.studentId?.level}</td>
              <td>{r.courseCode}</td>
              <td>{r.attendancePercent.toFixed(1)}%</td>
              <td className={r.atRisk ? 'at-risk' : 'ok'}>{r.atRisk ? 'At Risk' : 'Good'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
