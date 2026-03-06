// api/debug.js - Debug endpoint
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return debug information
  res.status(200).json({
    success: true,
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      nodeEnv: process.env.NODE_ENV || 'development',
      vercel: true
    },
    project: {
      name: 'TAAGC API',
      version: '1.0.0'
    },
    endpoints: {
      root: '/api',
      auth: '/api/auth',
      users: '/api/users',
      debug: '/api/debug'
    }
  });
}
