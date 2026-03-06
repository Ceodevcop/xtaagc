// api/debug.js
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default function handler(req, res) {
  try {
    // Check if firebase-admin can be resolved
    const firebaseAdminPath = require.resolve('firebase-admin');
    const hasFirebaseAdmin = true;
  } catch (e) {
    hasFirebaseAdmin = false;
  }

  res.status(200).json({
    nodeVersion: process.version,
    dependencies: {
      firebaseAdmin: hasFirebaseAdmin,
      // Check package.json
      packageJson: JSON.parse(fs.readFileSync('./package.json', 'utf8')).dependencies
    },
    cwd: process.cwd(),
    files: fs.readdirSync('./')
  });
}
