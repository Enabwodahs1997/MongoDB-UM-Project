import React from 'react';
import UserList from './components/UserList';
import Toasts from './components/Toasts';
import { useState } from 'react';

export default function App() {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = 'info') {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    // auto-remove
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    return id;
  }

  function removeToast(id) {
    setToasts(t => t.filter(x => x.id !== id));
  }

  return (
    <div className="app">
      <header className="header">
        <h1>MongoDB User Management</h1>
      </header>
      <main>
        <UserList showToast={showToast} />
      </main>
      <Toasts toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
