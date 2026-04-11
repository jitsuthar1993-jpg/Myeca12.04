import dotenv from "dotenv";
dotenv.config();

// Explicitly set project ID for Firebase Admin
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
if (projectId) {
    process.env.GOOGLE_CLOUD_PROJECT = projectId;
    process.env.GCLOUD_PROJECT = projectId;
}

import { adminDb } from "./server/firebase-admin";

async function findAdmin() {
  try {
    console.log(`Starting admin lookup for project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
    const email = process.env.ADMIN_EMAILS?.split(',')[0] || "admin@example.com";
    const snapshot = await adminDb.collection("users").where("email", "==", email).get();
    
    if (snapshot.empty) {
      console.log(`Admin user with email ${email} not found.`);
      // List a few users to see what's in there
      const samples = await adminDb.collection("users").limit(5).get();
      console.log(`Found ${samples.size} total users in 'users' collection.`);
      samples.forEach(doc => console.log(` - ${doc.id}: ${doc.data().email} (${doc.data().role})`));
      
      const allAdmins = await adminDb.collection("users").where("role", "==", "admin").get();
      if (!allAdmins.empty) {
          console.log(`Found alternative admin: ${allAdmins.docs[0].id} (${allAdmins.docs[0].data().email})`);
      } else {
          console.log("No users with role 'admin' found.");
      }
    } else {
      console.log(`Found admin: ${snapshot.docs[0].id}`);
    }
  } catch (error: any) {
    console.error("Error finding admin:", error.message);
    if (error.stack) console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

findAdmin();
