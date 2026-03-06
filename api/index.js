/*
// api/index.js
export default function handler(req, res) {
  res.status(200).json({
    name: "TAAGC Global API",
    version: "1.0.0",
    status: "operational",
    message: "API is running!",
    endpoints: {
      test: "/api/test",
      users: "/api/users",
      "set-role": "/api/set-role"
    },
    documentation: "https://docs.taagc.website"
  });
  
}
*/
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
      events: "/api/events",
      reports: "/api/reports",
      test: "/api/test"
    },
    timestamp: new Date().toISOString()
  });
}
