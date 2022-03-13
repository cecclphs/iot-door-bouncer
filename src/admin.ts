import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { credential } from 'firebase-admin';


const serviceAccount = require('../serviceAccount.json');

const admin = initializeApp({
    credential: credential.cert(serviceAccount),
    databaseURL: "https://cecdbfirebase.firebaseio.com"
});

const auth = getAuth(admin)
const db = getFirestore(admin);
const rtdb = getDatabase(admin);

export { admin, auth, db, rtdb };