export default function SortableTable({ columns, data, sortBy, order, onSort, renderRow }) {
  function arrow(key) {
    if (sortBy !== key) return '';
    return order === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} onClick={() => c.sortable !== false && onSort(c.key)}>
              {c.label}{c.sortable !== false ? arrow(c.key) : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length}>No records found</td></tr>
        ) : (
          data.map((row) => renderRow(row))
        )}
      </tbody>
    </table>
  );
}
