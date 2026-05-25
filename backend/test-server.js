import express from 'express';
import whatsappRoutes from './src/modules/whatsapp/whatsapp.routes.js';
import http from 'http';
import axios from 'axios';

const app = express();
app.use(express.json());
app.use('/api/v1/whatsapp', whatsappRoutes);

const server = http.createServer(app);
server.listen(3999, async () => {
  console.log('Server running on port 3999');

  try {
    const resGet = await axios.get('http://localhost:3999/api/v1/whatsapp/providers');
    console.log('GET STATUS:', resGet.status);
  } catch (err) {
    console.log('GET ERR STATUS:', err.response?.status);
  }

  try {
    const resPost = await axios.post('http://localhost:3999/api/v1/whatsapp/providers', {
      provider_name: 'meta',
    });
    console.log('POST STATUS:', resPost.status);
  } catch (err) {
    console.log('POST ERR STATUS:', err.response?.status);
  }

  server.close();
  process.exit(0);
});
