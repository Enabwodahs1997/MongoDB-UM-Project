import React from 'react';

export default function SearchBar({ placeholder, value, onChange }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="search-input"
    />
  );
}
