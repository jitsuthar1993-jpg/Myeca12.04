import Database from 'better-sqlite3';
import admin from "firebase-admin";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(
      serviceAccountKey.startsWith("{") 
        ? serviceAccountKey 
        : require("fs").readFileSync(serviceAccountKey, "utf8")
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  } else {
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  }
}

const db = admin.firestore();

const dummyUsers = [
  { email: "rahul.sharma@gmail.com", firstName: "Rahul", lastName: "Sharma", role: "user" },
  { email: "priya.patel@gmail.com", firstName: "Priya", lastName: "Patel", role: "user" },
  { email: "amit.kumar@gmail.com", firstName: "Amit", lastName: "Kumar", role: "user" },
  { email: "neha.singh@gmail.com", firstName: "Neha", lastName: "Singh", role: "user" },
  { email: "rajesh.verma@gmail.com", firstName: "Rajesh", lastName: "Verma", role: "user" },
  { email: "anjali.gupta@gmail.com", firstName: "Anjali", lastName: "Gupta", role: "user" },
  { email: "vikram.reddy@gmail.com", firstName: "Vikram", lastName: "Reddy", role: "user" },
  { email: "kavitha.nair@gmail.com", firstName: "Kavitha", lastName: "Nair", role: "user" },
  { email: "arjun.mehta@gmail.com", firstName: "Arjun", lastName: "Mehta", role: "user" },
  { email: "deepa.joshi@gmail.com", firstName: "Deepa", lastName: "Joshi", role: "user" }
];

const specialUsers = [
  { email: "ca.expert@myeca.in", firstName: "Expert", lastName: "CA", role: "ca", status: "active" },
  { email: "team.member@myeca.in", firstName: "Team", lastName: "Member", role: "team_member", status: "active" }
];

async function migrate() {
  console.log("🚀 Starting User Migration...");

  // 1. Get users from SQLite dev.db
  let sqliteUsers: any[] = [];
  try {
    const sqliteDb = new Database('dev.db');
    sqliteUsers = sqliteDb.prepare("SELECT * FROM users").all();
    console.log(`Found ${sqliteUsers.length} users in SQLite dev.db`);
    sqliteDb.close();
  } catch (err) {
    console.warn("⚠️ dev.db not accessible or empty, will use seed profiles only.");
  }

  // 2. Combine all users for migration
  const migrationMap = new Map<string, any>();

  // Use SQLite users as base
  sqliteUsers.forEach(u => {
    migrationMap.set(u.email.toLowerCase(), {
      id: u.id,
      email: u.email.toLowerCase(),
      firstName: u.first_name || "User",
      lastName: u.last_name || "",
      role: u.role || "user",
      status: u.status || "active",
      isVerified: u.is_verified === 1,
      createdAt: u.created_at ? new Date(u.created_at) : new Date(),
      updatedAt: new Date()
    });
  });

  // Add/Override with dummy users
  dummyUsers.forEach(u => {
    if (!migrationMap.has(u.email.toLowerCase())) {
       migrationMap.set(u.email.toLowerCase(), {
          email: u.email.toLowerCase(),
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          status: "active",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
       });
    }
  });

  // Add Special roles
  specialUsers.forEach(u => {
    migrationMap.set(u.email.toLowerCase(), {
      email: u.email.toLowerCase(),
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      status: u.status,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // FORCE ADMIN for requested email
  const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0] || "admin@example.com";
  const existingAdmin = migrationMap.get(adminEmail);
  if (existingAdmin) {
    console.log(`Setting ${adminEmail} to ADMIN role.`);
    existingAdmin.role = "admin";
  } else {
    console.log(`Creating Admin entry for ${adminEmail}`);
    migrationMap.set(adminEmail, {
      email: adminEmail,
      firstName: "CA",
      lastName: "J Suthar",
      role: "admin",
      status: "active",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log(`Final migration set: ${migrationMap.size} users.`);

  // 3. Batch write to Firestore
  const usersColl = db.collection("users");
  const batch = db.batch();

  for (const [email, userData] of migrationMap) {
    // We use email as ID or a stable ID if available
    const docId = userData.id || email.replace(/[@.]/g, '_');
    const userRef = usersColl.doc(docId);
    
    // Clean data for Firestore
    const firestoreData = { ...userData };
    delete firestoreData.id;
    
    batch.set(userRef, firestoreData, { merge: true });
    
    // Also create/update profile
    const profileRef = db.collection("profiles").doc(docId);
    batch.set(profileRef, {
      userId: docId,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role,
      updatedAt: new Date()
    }, { merge: true });
  }

  await batch.commit();
  console.log("✅ Migration Successful!");
  process.exit(0);
}

migrate();
