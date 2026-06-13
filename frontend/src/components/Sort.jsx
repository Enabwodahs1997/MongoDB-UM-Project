export default function Sort({ sortField, sortOrder, onSortFieldChange, onSortOrderChange }) {
  return (
    <div className="sort-controls">
        <label htmlFor="sort-field" style={{ fontWeight: 'bold' }}>
            Sort By
        </label>
        <select id="sort-field" value={sortField} onChange={(e) => onSortFieldChange(e.target.value)} className="ml-2 rounded-md border border-zinc-300 px-2 py-1">
            <option value="">None</option>
            <option value="firstname">First Name</option>
            <option value="lastname">Last Name</option>
            <option value="email">Email</option>
            <option value="age">Age</option>
            <option value="userID">User ID</option>
        </select>
        <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)} className="ml-2 rounded-md border border-zinc-300 px-2 py-1">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
        </select>
    </div>
  );
}