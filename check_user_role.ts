import dotenv from "dotenv";
dotenv.config();

import { adminDb } from "./server/firebase-admin";

async function checkUser() {
  const email = process.env.CHECK_EMAIL || "user@example.com";
  try {
    const snapshot = await adminDb.collection("users").where("email", "==", email).get();
    if (snapshot.empty) {
      console.log(`No user found with email: ${email}`);
    } else {
      snapshot.forEach(doc => {
        console.log(`User found: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
      });
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    process.exit(0);
  }
}

checkUser();
