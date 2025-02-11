import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config()

const serviceAccount = JSON.parse(
  readFileSync('./backend/config/dodo-project-42d5c-firebase-adminsdk-fbsvc-b355abaa2e.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;