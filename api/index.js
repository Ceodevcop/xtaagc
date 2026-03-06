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
