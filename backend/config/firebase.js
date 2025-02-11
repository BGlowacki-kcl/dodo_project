import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config()

const serviceAccount = JSON.parse(
  readFileSync(process.env.FIREBASE_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;
