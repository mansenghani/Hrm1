const axios = require('axios');
require('dotenv').config({ path: 'backend/.env' });
const jwt = require('jsonwebtoken');

async function testTasks() {
    try {
        const token = jwt.sign({ id: '69d73b69cef0a895f6e2c665', role: 'admin' }, process.env.JWT_SECRET);
        const url = 'http://localhost:5000/api/tasks/all';
        
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Task Count:', res.data.length);
        console.log('Tasks:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error:', err.response?.status, err.response?.data || err.message);
    }
}

testTasks();
