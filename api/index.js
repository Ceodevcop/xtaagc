// api/index.js
export default function handler(req, res) {
  res.status(200).json({
    name: "TAAGC Global API",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      investments: "/api/investments",
      transactions: "/api/transactions",
      debug: "/api/debug",
      test: "/api/test"
    },
    documentation: "https://docs.taagc.website",
    timestamp: new Date().toISOString()
  });
}
