import { useState } from 'react';
import api from '../api';

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      setMessage(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420 }}>
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <input type="password" placeholder="New password (8-16 chars, 1 uppercase, 1 special)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          {error && <div className="error">{error}</div>}
          {message && <div style={{ color: '#16a34a', fontSize: 13 }}>{message}</div>}
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
}
