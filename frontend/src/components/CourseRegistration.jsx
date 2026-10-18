import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CourseRegistration() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const semester = 1;
  const session = '2025/2026';

  useEffect(() => {
    api.get(`/courses/eligible?semester=${semester}`)
      .then((res) => setCourses(res.data))
      .catch(() => setMessage('Could not load courses'));
  }, []);

  function toggleCourse(courseCode) {
    setSelected((prev) =>
      prev.includes(courseCode) ? prev.filter((c) => c !== courseCode) : [...prev, courseCode]
    );
  }

  async function handleRegister() {
    setMessage('');
    try {
      const res = await api.post('/registration/register', {
        courseCodes: selected, session, semester,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <div className="card">
      <h2>Register Courses — Semester {semester}</h2>
      {courses.length === 0 && <p>No eligible courses found.</p>}
      <ul className="course-list">
        {courses.map((c) => (
          <li key={c.courseCode}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(c.courseCode)}
                onChange={() => toggleCourse(c.courseCode)}
              />
              {c.courseCode} — {c.title} ({c.units} units)
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleRegister} disabled={selected.length === 0}>
        Register Selected Courses
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
