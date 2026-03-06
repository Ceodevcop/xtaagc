// api/test.js
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      investments: '/api/investments',
      transactions: '/api/transactions',
      debug: '/api/debug'
    }
  });
}
