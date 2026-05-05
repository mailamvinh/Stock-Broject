export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'OK', message: 'Auth proxy is running' });
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'USERNAME AND PASSWORD REQUIRED' });
    }

    console.log('Attempting login for:', username);
    console.log('API Key present:', !!process.env.DNSE_API_KEY);

    const response = await fetch(
      'https://api.dnse.com.vn/user-service/api/auth',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DNSE_API_KEY || ''}`
        },
        body: JSON.stringify({ username, password })
      }
    );

    console.log('DNSE response status:', response.status);
    const text = await response.text();
    console.log('DNSE response body:', text);

    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    return res.status(response.status).json(data);

  } catch (err) {
    console.log('Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
