import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get(`/analytics/student/${user.id}`)
      .then((res) => setRecords(res.data))
      .catch(() => {});
  }, [user.id]);

  return (
    <div className="card">
      <h2>My Attendance</h2>
      {records.length === 0 && <p>No attendance data yet.</p>}
      <table>
        <thead>
          <tr><th>Course</th><th>Attended</th><th>Total</th><th>Percentage</th><th>Status</th></tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.courseCode}>
              <td>{r.courseCode}</td>
              <td>{r.attendedSessions}</td>
              <td>{r.totalSessions}</td>
              <td>{r.attendancePercent.toFixed(1)}%</td>
              <td className={r.atRisk ? 'at-risk' : 'ok'}>{r.atRisk ? 'At Risk' : 'Good'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
