import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', department: 'CS', level: 100, matricNo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register({ ...form, role: 'student', level: Number(form.level) });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  }

  if (success) {
    return <div className="auth-page"><p>Account created! Redirecting to login...</p></div>;
  }

  return (
    <div className="auth-page">
      <h1>Student Registration</h1>
      <form onSubmit={handleSubmit}>
        <label>Full Name
          <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
        </label>
        <label>Email
          <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
        </label>
        <label>Department
          <select value={form.department} onChange={(e) => updateField('department', e.target.value)}>
            <option value="CS">Computer Science</option>
            <option value="CyberSec">Cyber Security</option>
            <option value="IT">Information Technology</option>
          </select>
        </label>
        <label>Level
          <select value={form.level} onChange={(e) => updateField('level', e.target.value)}>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={300}>300</option>
            <option value={400}>400</option>
          </select>
        </label>
        <label>Matric Number
          <input value={form.matricNo} onChange={(e) => updateField('matricNo', e.target.value)} required />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Create Account</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
