import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    courseCode: '', title: '', units: 3, level: 100, semester: 1, department: 'CS', isFacultyWide: false,
  });
  const [message, setMessage] = useState('');

  function loadCourses() {
    api.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
  }

  useEffect(loadCourses, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/courses', {
        ...form,
        units: Number(form.units), level: Number(form.level), semester: Number(form.semester),
      });
      setMessage('Course added successfully');
      loadCourses();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not add course');
    }
  }

  return (
    <div className="card">
      <h2>Manage Course Catalogue</h2>
      <form onSubmit={handleAdd} className="inline-form">
        <input placeholder="Course Code" value={form.courseCode} onChange={(e) => updateField('courseCode', e.target.value)} required />
        <input placeholder="Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
        <input type="number" placeholder="Units" value={form.units} onChange={(e) => updateField('units', e.target.value)} min={1} max={6} />
        <select value={form.level} onChange={(e) => updateField('level', e.target.value)}>
          <option value={100}>100</option><option value={200}>200</option>
          <option value={300}>300</option><option value={400}>400</option>
        </select>
        <select value={form.semester} onChange={(e) => updateField('semester', e.target.value)}>
          <option value={1}>Semester 1</option><option value={2}>Semester 2</option>
        </select>
        <select value={form.department} onChange={(e) => updateField('department', e.target.value)}>
          <option value="CS">Computer Science</option>
          <option value="CyberSec">Cyber Security</option>
          <option value="IT">Information Technology</option>
          <option value="Shared">Shared</option>
        </select>
        <label>
          <input type="checkbox" checked={form.isFacultyWide} onChange={(e) => updateField('isFacultyWide', e.target.checked)} />
          Faculty-wide
        </label>
        <button type="submit">Add Course</button>
      </form>
      {message && <p>{message}</p>}
      <table>
        <thead><tr><th>Code</th><th>Title</th><th>Units</th><th>Level</th><th>Sem</th><th>Dept</th></tr></thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.courseCode}>
              <td>{c.courseCode}</td><td>{c.title}</td><td>{c.units}</td>
              <td>{c.level}</td><td>{c.semester}</td><td>{c.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
