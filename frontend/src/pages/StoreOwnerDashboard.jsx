import { useEffect, useState } from 'react';
import api from '../api';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/store-owner/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="container">Loading...</div>;

  if (!data.store) {
    return (
      <div className="container">
        <div className="card">No store is assigned to your account yet. Contact an admin.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>{data.store.name} — Dashboard</h2>
        <div className="stats-row">
          <div className="stat-box">
            <div className="num">{data.averageRating}</div>
            Average Rating
          </div>
          <div className="stat-box">
            <div className="num">{data.raters.length}</div>
            Total Raters
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Users Who Rated Your Store</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Rating</th><th>Date</th></tr>
          </thead>
          <tbody>
            {data.raters.length === 0 ? (
              <tr><td colSpan={4}>No ratings yet</td></tr>
            ) : (
              data.raters.map((r) => (
                <tr key={r.id + '-' + r.created_at}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.rating}</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
