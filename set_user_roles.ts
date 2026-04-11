import "dotenv/config";
import { adminDb } from "./server/firebase-admin";

async function setUserRoles() {
  const usersToUpdate = [
    { email: process.env.ADMIN_EMAILS?.split(',')[0] || "admin@example.com", role: "admin" },
    { email: process.env.TEAM_MEMBER_EMAILS?.split(',')[0] || "team@example.com", role: "team_member" }
  ];

  for (const user of usersToUpdate) {
    try {
      const snapshot = await adminDb.collection("users")
        .where("email", "==", user.email)
        .get();

      if (snapshot.empty) {
        console.log(`User with email ${user.email} not found in Firestore. If they haven't logged in yet, please have them register first.`);
        continue;
      }

      const doc = snapshot.docs[0];
      await doc.ref.update({ role: user.role });
      console.log(`Successfully updated ${user.email} to role: ${user.role}`);
    } catch (error) {
      console.error(`Error updating ${user.email}:`, error);
    }
  }
}

setUserRoles();
