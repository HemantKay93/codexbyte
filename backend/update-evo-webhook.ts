import axios from 'axios';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_KEY = "fdde541e24e9426eab70f15266c05bf2";
const BASE_URL = "https://wapi.byteevolvr.com";
const INSTANCE_NAME = "Byteevolvr";

rl.question('What is your Render Backend URL? (e.g. https://byteevolvr-backend.onrender.com) \n> ', async (renderUrl) => {
  const url = renderUrl.trim().replace(/\/$/, ""); // remove trailing slash
  
  const payload = {
    webhook: {
      enabled: true,
      url: `${url}/api/v1/whatsapp/webhook`,
      byEvents: false,
      base64: false,
      events: [
        "MESSAGES_UPSERT",
        "MESSAGES_UPDATE"
      ]
    }
  };

  try {
    console.log(`\nUpdating webhook for instance '${INSTANCE_NAME}'...`);
    const response = await axios.post(`${BASE_URL}/webhook/set/${INSTANCE_NAME}`, payload, {
      headers: { apikey: API_KEY }
    });
    
    console.log('\n✅ Successfully updated Evolution API Webhook!');
    console.log('Evolution Response:', response.data);
    console.log(`\nAll incoming messages will now be forwarded to: ${payload.webhook.url}`);
    
  } catch (error: any) {
    console.error('\n❌ Failed to update webhook.');
    console.error(error.response?.data || error.message);
  } finally {
    rl.close();
  }
});
