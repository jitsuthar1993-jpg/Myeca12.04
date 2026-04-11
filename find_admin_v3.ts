import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";

// Explicitly set project ID for Firebase Admin
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
if (projectId) {
    process.env.GOOGLE_CLOUD_PROJECT = projectId;
    process.env.GCLOUD_PROJECT = projectId;
}

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
      const key = serviceAccountKey.trim();
      const serviceAccount = JSON.parse(
        key.startsWith("{") 
          ? key 
          : require("fs").readFileSync(key, "utf8")
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
      });
      console.log("[FIREBASE] Initialized with Service Account Key");
  } else {
    admin.initializeApp({
      projectId: projectId,
    });
    console.warn("[FIREBASE] Running without Service Account Key (ADC only)");
  }
}

const db = admin.firestore();

async function findAdmin() {
  try {
    const email = process.env.ADMIN_EMAILS?.split(',')[0] || "admin@example.com";
    console.log(`Searching for admin: ${email}`);
    const snapshot = await db.collection("users").where("email", "==", email).get();
    
    if (snapshot.empty) {
      console.log(`Admin user with email ${email} not found.`);
      const allUsers = await db.collection("users").limit(10).get();
      console.log(`Found ${allUsers.size} total users.`);
      allUsers.forEach(d => console.log(` - ${d.id}: ${d.data().email} (${d.data().role})`));
    } else {
      console.log(`SUCCESS_FOUND_ADMIN: ${snapshot.docs[0].id}`);
    }
  } catch (error: any) {
    console.error("Error finding admin:", error.message);
  } finally {
    process.exit(0);
  }
}

findAdmin();
