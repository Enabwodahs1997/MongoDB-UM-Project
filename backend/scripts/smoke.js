const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';

async function run() {
  try {
    console.log('Creating test user...');
    const createRes = await axios.post(`${API}/users`, { name: 'Smoke Tester', email: `smoke+${Date.now()}@example.com` });
    console.log('Created:', createRes.data._id);

    console.log('Listing users...');
    const listRes = await axios.get(`${API}/users`);
    console.log(`Found ${listRes.data.length} users (showing up to 3):`);
    console.log(listRes.data.slice(0,3).map(u=>({id:u._id,name:u.name,email:u.email})));

    console.log('Deleting test user...');
    await axios.delete(`${API}/users/${createRes.data._id}`);
    console.log('Deleted. Smoke test passed.');
  } catch (err) {
    console.error('Smoke test failed:', err.message);
    if (err.response) console.error('Response:', err.response.status, err.response.data);
    process.exitCode = 2;
  }
}

run();
