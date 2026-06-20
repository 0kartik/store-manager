import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function clientValidate() {
    if (form.name.length < 20 || form.name.length > 60) return 'Name must be 20-60 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email';
    if (form.address.length > 400) return 'Address must be under 400 characters';
    if (form.password.length < 8 || form.password.length > 16) return 'Password must be 8-16 characters';
    if (!/[A-Z]/.test(form.password)) return 'Password needs an uppercase letter';
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.password)) return 'Password needs a special character';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientError = clientValidate();
    if (clientError) return setError(clientError);

    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      login(res.data.user, res.data.token);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container auth-page">
      <div className="card" style={{ maxWidth: 460, width: '100%' }}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Full name (20-60 characters)" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          <input placeholder="Address (max 400 characters)" value={form.address} onChange={(e) => update('address', e.target.value)} />
          <input type="password" placeholder="Password (8-16 chars, 1 uppercase, 1 special char)" value={form.password} onChange={(e) => update('password', e.target.value)} required />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
        </form>
        <p style={{ marginTop: 12, fontSize: 14 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
