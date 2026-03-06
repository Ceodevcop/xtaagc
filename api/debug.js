// api/debug.js
import fs from 'fs';
import admin, { isInitialized } from './lib/firebase-admin.js';

export default function handler(req, res) {
  const status = {
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    firebase: {
      initialized: isInitialized ? isInitialized() : admin.apps.length > 0,
      projectId: admin.app()?.options?.projectId || 'not set',
      apps: admin.apps?.length || 0
    },
    envVars: {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.FIREBASE_API_KEY
    },
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    files: fs.readdirSync('./api').slice(0, 10) // List first 10 api files
  };

  res.status(200).json({
    success: true,
    debug: status
  });
}
