import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import Sort from './Sort';

export default function UserList({ showToast }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [userID, setUserID] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFirstname, setEditFirstname] = useState('');
  const [editLastname, setEditLastname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editUserID, setEditUserID] = useState('');
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const [sortField, setSortField] = useState('');
const [sortOrder, setSortOrder] = useState('asc');

function handleSortFieldChange(field) {
  setSortField(field);
  fetchUsers(field, sortOrder);
}

function handleSortOrderChange(order) {
  setSortOrder(order);
  fetchUsers(sortField, order);
}

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(u =>
      u.firstname.toLowerCase().includes(term) ||
      u.lastname.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.userID.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  async function fetchUsers(sortField = '', sortOrder = 'asc') {
    const res = await axios.get(`${apiBase}/users`, {
      params: {
        sortField,
        sortOrder
      }
    });
    setUsers(res.data);
  }

  async function addUser(e) {
    e.preventDefault();
    const err = validate(firstname, lastname, email);
    if (err) {
      setAddError(err);
      return;
    }
    setAddError('');
    try {
      const res = await axios.post(`${apiBase}/users`, { firstname, lastname, email, age, userID });
      setFirstname(''); setLastname(''); setEmail(''); setAge(''); setUserID('');
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
      const err = validate(editFirstname, editLastname, editEmail);
      if (err) {
        setEditError(err);
        return;
      }
      setEditError('');
      await axios.put(`${apiBase}/users/${id}`, { firstname: editFirstname, lastname: editLastname, email: editEmail, age: editAge, userID: editUserID });
      setEditingId(null);
      setEditFirstname('');
      setEditLastname('');
      setEditEmail('');
      fetchUsers();
      if (showToast) showToast('User updated', 'success');
    } catch (err) {
      const msg = err.response && (err.response.data && (err.response.data.errors || err.response.data.error)) ? JSON.stringify(err.response.data.errors || err.response.data.error) : err.message;
      setEditError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      if (showToast) showToast('Failed to update user', 'error');
    }
  }

  function validate(firstnameVal, lastnameVal, emailVal) {
    if (!firstnameVal || firstnameVal.trim().length < 2) return 'First name must be at least 2 characters.';
    if (!lastnameVal || lastnameVal.trim().length < 2) return 'Last name must be at least 2 characters.';
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
    <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Sort sortField={sortField} sortOrder={sortOrder} onSortFieldChange={handleSortFieldChange} onSortOrderChange={handleSortOrderChange} />
    </div>
      <div className="search-container">
        <SearchBar placeholder="Search by name, email, or ID..." value={searchTerm} onChange={setSearchTerm} />
        <div style={{ height: '12px' }}></div>
      </div>
      <div className="card">
              <form onSubmit={addUser} className="user-form">
                  <div className="form-row">
                      <input value={firstname} onChange={e => setFirstname(e.target.value)} placeholder="First Name" />
                      <input value={lastname} onChange={e => setLastname(e.target.value)} placeholder="Last Name" />
                      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                      <input value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
                      <input value={userID} onChange={e => setUserID(e.target.value)} placeholder="User ID" />
                      <button type="submit" className="btn primary">Add</button>
                  </div>
                  {addError && <div className="error-text">{addError}</div>}
              </form>

              <ul className="user-list">
                  {filteredUsers.map(u => (
                      <li key={u._id} className="user-item">
                          {editingId === u._id ? (
                              <div className="edit-row">
                                  <input className="edit-input" value={editFirstname} onChange={e => setEditFirstname(e.target.value)} />
                                  <input className="edit-input" value={editLastname} onChange={e => setEditLastname(e.target.value)} />
                                  <input className="edit-input" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                                  <input className="edit-input" value={editAge} onChange={e => setEditAge(e.target.value)} />
                                  <input className="edit-input" value={editUserID} onChange={e => setEditUserID(e.target.value)} />
                                  <button className="btn primary" onClick={() => updateUser(u._id)}>Update</button>
                                  <button className="btn secondary" onClick={() => { setEditingId(null); setEditFirstname(''); setEditLastname(''); setEditEmail(''); setEditAge(''); setEditUserID(''); setEditError(''); } }>Cancel</button>
                                  {editError && <div className="error-text">{editError}</div>}
                              </div>
                          ) : (
                              <>
                                  <div>
                                      <strong>{u.firstname} {u.lastname}</strong>
                                      <div className="muted">{u.email}</div>
                                      <div className="muted">Age: {u.age || 'N/A'} | ID: {u.userID}</div>
                                  </div>
                                  <div>
                                      <button onClick={() => { setEditingId(u._id); setEditFirstname(u.firstname); setEditLastname(u.lastname); setEditEmail(u.email); setEditAge(u.age || ''); setEditUserID(u.userID); } }>Edit</button>
                                      <button className="danger" onClick={() => deleteUser(u._id)}>Delete</button>
                                  </div>
                              </>
                          )}
                      </li>
                  ))}
              </ul>
          </div></>
  );
}
