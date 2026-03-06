// api/test.js
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID
    }
  });
}
