import { useState } from 'react';
import api from '../services/api';

export default function CourseReport() {
  const [courseCode, setCourseCode] = useState('');
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');

  async function loadReport() {
    setMessage('');
    try {
      const res = await api.get(`/analytics/course/${courseCode}`);
      setRecords(res.data);
      if (res.data.length === 0) setMessage('No analytics data yet for this course.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not load report');
    }
  }

  return (
    <div className="card">
      <h2>Course Attendance Report</h2>
      <label>Course Code
        <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CSC 311" />
      </label>
      <button onClick={loadReport}>Load Report</button>
      {message && <p>{message}</p>}
      {records.length > 0 && (
        <table>
          <thead>
            <tr><th>Student</th><th>Matric No</th><th>Attended</th><th>Total</th><th>%</th><th>Status</th></tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.studentId?.name}</td>
                <td>{r.studentId?.matricNo}</td>
                <td>{r.attendedSessions}</td>
                <td>{r.totalSessions}</td>
                <td>{r.attendancePercent.toFixed(1)}%</td>
                <td className={r.atRisk ? 'at-risk' : 'ok'}>{r.atRisk ? 'At Risk' : 'Good'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
