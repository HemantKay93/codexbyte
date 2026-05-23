import axios from 'axios';

async function test() {
  try {
    console.log('Testing /api/admin/stats...');
    // We don't have a token here, but we want to see if it responds or timeouts
    const response = await axios.get('http://localhost:8080/api/admin/stats', {
      timeout: 5000
    });
    console.log('Response:', response.data);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
}

test();
