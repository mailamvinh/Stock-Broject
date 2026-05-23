export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const symbol = req.query.symbol || 'VCB';

  const results = {};

  // Test 1: quote-ask-bid with Bearer token
  try {
    const r = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/quote-ask-bid`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    results.test1_bearer = { status: r.status, body: await r.text() };
  } catch(e) { results.test1_bearer = { error: e.message }; }

  // Test 2: without any auth
  try {
    const r = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}/quote-ask-bid`
    );
    results.test2_noauth = { status: r.status, body: await r.text() };
  } catch(e) { results.test2_noauth = { error: e.message }; }

  // Test 3: get market token first, then use it
  try {
    const tokenRes = await fetch(
      'https://api.dnse.com.vn/market-data-service/v2/token',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const tokenData = await tokenRes.text();
    results.test3_market_token = { status: tokenRes.status, body: tokenData };
  } catch(e) { results.test3_market_token = { error: e.message }; }

  // Test 4: trading info endpoint
  try {
    const r = await fetch(
      `https://api.dnse.com.vn/market-data-service/v2/securities/${symbol}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    results.test4_securities = { status: r.status, body: await r.text() };
  } catch(e) { results.test4_securities = { error: e.message }; }

  // Test 5: user-service get account (to confirm token works)
  try {
    const r = await fetch(
      'https://api.dnse.com.vn/user-service/api/me',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    results.test5_me = { status: r.status, body: (await r.text()).slice(0, 300) };
  } catch(e) { results.test5_me = { error: e.message }; }

  // Test 6: investor endpoint
  try {
    const r = await fetch(
      'https://api.dnse.com.vn/user-service/api/investor',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    results.test6_investor = { status: r.status, body: (await r.text()).slice(0, 300) };
  } catch(e) { results.test6_investor = { error: e.message }; }

  res.status(200).json({
    token_present: !!token,
    token_preview: token ? token.slice(0, 40) + '...' : 'NONE',
    symbol,
    results
  });
}
