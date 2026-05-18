import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

async function testShiprocket() {
  console.log('Testing Shiprocket credentials...');
  console.log('Email:', process.env.SHIPROCKET_EMAIL);

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    console.log('✅ Login Successful!');
    console.log('Token received:', response.data.token.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Login Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testShiprocket();
