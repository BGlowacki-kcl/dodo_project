import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  readFileSync('./backend/config/dodo-project-42d5c-firebase-adminsdk-fbsvc-681422d262.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;