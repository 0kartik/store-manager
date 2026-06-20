import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import SortableTable from '../components/SortableTable';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('users'); // users | stores | addUser | addStore

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Admin Dashboard</h2>
        {stats && (
          <div className="stats-row">
            <div className="stat-box"><div className="num">{stats.totalUsers}</div>Total Users</div>
            <div className="stat-box"><div className="num">{stats.totalStores}</div>Total Stores</div>
            <div className="stat-box"><div className="num">{stats.totalRatings}</div>Total Ratings</div>
          </div>
        )}
      </div>

      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'stores' ? 'active' : ''} onClick={() => setTab('stores')}>Stores</button>
        <button className={tab === 'addUser' ? 'active' : ''} onClick={() => setTab('addUser')}>Add User</button>
        <button className={tab === 'addStore' ? 'active' : ''} onClick={() => setTab('addStore')}>Add Store</button>
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'stores' && <StoresTab />}
      {tab === 'addUser' && <AddUserForm />}
      {tab === 'addStore' && <AddStoreForm />}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const fetchUsers = useCallback(() => {
    api.get('/admin/users', { params: { ...filters, sortBy, order } })
      .then((res) => setUsers(res.data.users));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleSort(key) {
    if (sortBy === key) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setOrder('asc'); }
  }

  async function handleView(userId) {
    setDetailError('');
    setDetailLoading(true);
    setSelectedUser({ id: userId }); // open modal immediately with a loading state
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data.user);
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setSelectedUser(null);
    setDetailError('');
  }

  return (
    <div className="card">
      <h3>All Users</h3>
      <div className="filters">
        <input placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Filter by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
      </div>
      <SortableTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address' },
          { key: 'role', label: 'Role' },
          { key: 'view', label: '', sortable: false },
        ]}
        data={users}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        renderRow={(u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.address}</td>
            <td>{u.role}</td>
            <td><button className="link-btn" onClick={() => handleView(u.id)}>View</button></td>
          </tr>
        )}
      />

      {selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h3>User Details</h3>
            {detailLoading ? (
              <p>Loading...</p>
            ) : detailError ? (
              <div className="error">{detailError}</div>
            ) : (
              <div className="detail-grid">
                <div><strong>Name</strong><span>{selectedUser.name}</span></div>
                <div><strong>Email</strong><span>{selectedUser.email}</span></div>
                <div><strong>Address</strong><span>{selectedUser.address || '—'}</span></div>
                <div><strong>Role</strong><span>{selectedUser.role}</span></div>
                {selectedUser.role === 'STORE_OWNER' && (
                  <div><strong>Rating</strong><span>{selectedUser.rating}</span></div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StoresTab() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const fetchStores = useCallback(() => {
    api.get('/admin/stores', { params: { ...filters, sortBy, order } })
      .then((res) => setStores(res.data.stores));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  function handleSort(key) {
    if (sortBy === key) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setOrder('asc'); }
  }

  return (
    <div className="card">
      <h3>All Stores</h3>
      <div className="filters">
        <input placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Filter by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
      </div>
      <SortableTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address' },
          { key: 'rating', label: 'Rating' },
        ]}
        data={stores}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        renderRow={(s) => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>{s.email}</td>
            <td>{s.address}</td>
            <td>{s.rating}</td>
          </tr>
        )}
      />
    </div>
  );
}

function AddUserForm() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.post('/admin/users', form);
      setMessage('User created successfully');
      setForm({ name: '', email: '', address: '', password: '', role: 'USER' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  }

  return (
    <div className="card">
      <h3>Add New User</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name (20-60 chars)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Address (max 400 chars)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="USER">Normal User</option>
          <option value="ADMIN">Admin</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
        {error && <div className="error">{error}</div>}
        {message && <div style={{ color: '#16a34a', fontSize: 13 }}>{message}</div>}
        <button type="submit">Create User</button>
      </form>
    </div>
  );
}

function AddStoreForm() {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || null });
      setMessage('Store created successfully');
      setForm({ name: '', email: '', address: '', ownerId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create store');
    }
  }

  return (
    <div className="card">
      <h3>Add New Store</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Store name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Store email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Address (max 400 chars)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input placeholder="Owner user ID (optional, must be a Store Owner)" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} />
        {error && <div className="error">{error}</div>}
        {message && <div style={{ color: '#16a34a', fontSize: 13 }}>{message}</div>}
        <button type="submit">Create Store</button>
      </form>
    </div>
  );
}