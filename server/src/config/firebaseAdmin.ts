import admin from "firebase-admin";
import 'dotenv/config';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? (() => { throw new Error("FIREBASE_PRIVATE_KEY is not set in environment variables."); })()).replace(/\\n/g, "\n"), // fix \n
  }),
});

export default admin;
