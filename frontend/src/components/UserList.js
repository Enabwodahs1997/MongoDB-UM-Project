import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserList({ showToast }) {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await axios.get(`${apiBase}/users`);
    setUsers(res.data);
  }

  async function addUser(e) {
    e.preventDefault();
    const err = validate(name, email);
    if (err) {
      setAddError(err);
      return;
    }
    setAddError('');
    try {
      const res = await axios.post(`${apiBase}/users`, { name, email });
      setName(''); setEmail('');
      fetchUsers();
      if (showToast) showToast('User created', 'success');
    } catch (err) {
      const msg = err.response && (err.response.data && (err.response.data.errors || err.response.data.error)) ? JSON.stringify(err.response.data.errors || err.response.data.error) : err.message;
      setAddError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      if (showToast) showToast('Failed to create user', 'error');
    }
  }

  async function updateUser(id) {
    try {
      const err = validate(editName, editEmail);
      if (err) {
        setEditError(err);
        return;
      }
      setEditError('');
      await axios.put(`${apiBase}/users/${id}`, { name: editName, email: editEmail });
      setEditingId(null);
      setEditName('');
      setEditEmail('');
      fetchUsers();
      if (showToast) showToast('User updated', 'success');
    } catch (err) {
      const msg = err.response && (err.response.data && (err.response.data.errors || err.response.data.error)) ? JSON.stringify(err.response.data.errors || err.response.data.error) : err.message;
      setEditError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      if (showToast) showToast('Failed to update user', 'error');
    }
  }

  function validate(nameVal, emailVal) {
    if (!nameVal || nameVal.trim().length < 2) return 'Name must be at least 2 characters.';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRe.test(emailVal)) return 'Please enter a valid email address.';
    return '';
  }

  async function deleteUser(id) {
    try {
      await axios.delete(`${apiBase}/users/${id}`);
      fetchUsers();
      if (showToast) showToast('User deleted', 'success');
    } catch (err) {
      if (showToast) showToast('Failed to delete user', 'error');
      console.error('Delete failed', err.response ? err.response.data : err.message);
    }
  }

  // Debounced email uniqueness check for add and edit fields
  useEffect(() => {
    const controller = new AbortController();
    let timeout;
    if (email && email.length > 3) {
      timeout = setTimeout(async () => {
        try {
          const res = await axios.get(`${apiBase}/users/check-email`, { params: { email }, signal: controller.signal });
          if (res.data.exists) setAddError('Email already in use');
          else setAddError('');
        } catch (err) {
          // ignore if aborted
        }
      }, 600);
    }
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [email]);

  useEffect(() => {
    const controller = new AbortController();
    let timeout;
    if (editEmail && editEmail.length > 3) {
      timeout = setTimeout(async () => {
        try {
          const res = await axios.get(`${apiBase}/users/check-email`, { params: { email: editEmail }, signal: controller.signal });
          // if exists and not the same user
          if (res.data.exists) {
            // We need to check if the existing email belongs to the same user; skip if same
            const same = users.find(u => u.email === editEmail && u._id === editingId);
            if (!same) setEditError('Email already in use');
            else setEditError('');
          } else setEditError('');
        } catch (err) {
          // ignore
        }
      }, 600);
    }
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [editEmail, editingId]);

  return (
    <div className="card">
      <form onSubmit={addUser} className="user-form">
        <div className="form-row">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <button type="submit" className="btn primary">Add</button>
        </div>
        {addError && <div className="error-text">{addError}</div>}
      </form>

      <ul className="user-list">
        {users.map(u => (
          <li key={u._id} className="user-item">
            {editingId === u._id ? (
              <div className="edit-row">
                <input className="edit-input" value={editName} onChange={e=>setEditName(e.target.value)} />
                <input className="edit-input" value={editEmail} onChange={e=>setEditEmail(e.target.value)} />
                <button className="btn primary" onClick={()=>updateUser(u._id)}>Update</button>
                <button className="btn secondary" onClick={()=>{setEditingId(null); setEditName(''); setEditEmail(''); setEditError('');}}>Cancel</button>
                {editError && <div className="error-text">{editError}</div>}
              </div>
            ) : (
              <>
                <div>
                  <strong>{u.name}</strong>
                  <div className="muted">{u.email}</div>
                </div>
                <div>
                  <button onClick={() => { setEditingId(u._id); setEditName(u.name); setEditEmail(u.email); }}>Edit</button>
                  <button className="danger" onClick={() => deleteUser(u._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
