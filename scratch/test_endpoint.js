const axios = require('axios');
require('dotenv').config({ path: 'backend/.env' });
const jwt = require('jsonwebtoken');

async function testEndpoint() {
    try {
        // Create a fake token for admin
        const token = jwt.sign({ id: 'someid', role: 'admin' }, process.env.JWT_SECRET);
        
        // This won't work because the server is on another process and we need the actual server URL.
        // But the server is running on port 5000 (from previous analysis).
        const url = 'http://localhost:5000/api/personnel/all';
        
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error:', err.response?.status, err.response?.data || err.message);
    }
}

testEndpoint();
