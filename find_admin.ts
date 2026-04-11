import dotenv from "dotenv";
dotenv.config();

import { adminDb } from "./server/firebase-admin";

async function findAdmin() {
  try {
    const email = process.env.ADMIN_EMAILS?.split(',')[0] || "admin@example.com";
    const snapshot = await adminDb.collection("users").where("email", "==", email).get();
    
    if (snapshot.empty) {
      console.log(`Admin user with email ${email} not found.`);
      // Check for any admin
      const allAdmins = await adminDb.collection("users").where("role", "==", "admin").get();
      if (!allAdmins.empty) {
          console.log(`Found alternative admin: ${allAdmins.docs[0].id} (${allAdmins.docs[0].data().email})`);
      }
    } else {
      console.log(`Found admin: ${snapshot.docs[0].id}`);
    }
  } catch (error: any) {
    console.error("Error finding admin:", error.message);
  } finally {
    process.exit(0);
  }
}

findAdmin();
