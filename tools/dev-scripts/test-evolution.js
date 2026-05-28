import axios from 'axios';

async function test() {
  try {
    const res = await axios.post(
      'https://wapi.byteevolvr.com/message/sendText/Byteevolvr',
      {
        number: '919646772218',
        options: { delay: 1200, presence: 'composing' },
        text: 'test from server root text property',
      },
      {
        headers: { apikey: 'fdde541e24e9426eab70f15266c05bf2', 'Content-Type': 'application/json' },
      }
    );
    console.log('OK', res.data);
  } catch (e) {
    console.log('ERR', JSON.stringify(e.response?.data || e.message, null, 2));
  }
}

test();
