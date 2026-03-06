export default function handler(req, res) {
  res.status(200).json({
    name: "TAAGC Global API",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      auth: "/api/auth/*",
      users: "/api/users",
      investments: "/api/investments",
      transactions: "/api/transactions",
      events: "/api/events",
      reports: "/api/reports"
    },
    documentation: "https://docs.taagc.website" // Update this when docs are live
  });
}
/*
// API entry point - Health check and API info
export default function handler(req, res) {
  res.status(200).json({
    name: "TAAGC Global API",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      auth: "/api/auth/*",
      users: "/api/users",
      investments: "/api/investments",
      transactions: "/api/transactions",
      events: "/api/events",
      reports: "/api/reports"
    },
    documentation: "https://docs.taagc.website"
  });
}
*/
