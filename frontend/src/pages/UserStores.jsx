import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import SortableTable from '../components/SortableTable';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const fetchStores = useCallback(() => {
    api.get('/user/stores', { params: { ...filters, sortBy, order } })
      .then((res) => setStores(res.data.stores));
  }, [filters, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  function handleSort(key) {
    if (sortBy === key) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setOrder('asc'); }
  }

  async function submitRating(storeId, rating) {
    await api.post('/user/ratings', { storeId, rating });
    fetchStores();
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Browse Stores</h2>
        <div className="filters">
          <input placeholder="Search by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <input placeholder="Search by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        </div>
        <SortableTable
          columns={[
            { key: 'name', label: 'Store Name' },
            { key: 'address', label: 'Address' },
            { key: 'overall_rating', label: 'Overall Rating' },
            { key: 'user_rating', label: 'Your Rating', sortable: false },
          ]}
          data={stores}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          renderRow={(s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.address}</td>
              <td>{s.overall_rating}</td>
              <td>
                <StarPicker
                  value={s.user_rating}
                  onSelect={(val) => submitRating(s.id, val)}
                />
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}

function StarPicker({ value, onSelect }) {
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={value && n <= value ? 'filled' : ''}
          onClick={() => onSelect(n)}
          title={value ? 'Click to update your rating' : 'Click to rate'}
        >
          ★
        </button>
      ))}
    </div>
  );
}
