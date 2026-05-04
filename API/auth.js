export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // GET request — health check to test in browser
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'OK', message: 'Auth proxy is running' });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'USERNAME AND PASSWORD REQUIRED' });
    }

    const response = await fetch('https://api.dnse.com.vn/auth-service/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DNSE_API_KEY || ''}`
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
