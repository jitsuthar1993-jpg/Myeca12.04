// @ts-nocheck
import { db } from "../db";
import { users, profiles } from "@shared/schema";
import bcrypt from "bcryptjs";

const dummyUsers = [
  {
    email: "rahul.sharma@gmail.com",
    firstName: "Rahul",
    lastName: "Sharma",
    password: "password123",
    role: "user"
  },
  {
    email: "priya.patel@gmail.com",
    firstName: "Priya",
    lastName: "Patel",
    password: "password123",
    role: "user"
  },
  {
    email: "amit.kumar@gmail.com",
    firstName: "Amit",
    lastName: "Kumar",
    password: "password123",
    role: "user"
  },
  {
    email: "neha.singh@gmail.com",
    firstName: "Neha",
    lastName: "Singh",
    password: "password123",
    role: "user"
  },
  {
    email: "rajesh.verma@gmail.com",
    firstName: "Rajesh",
    lastName: "Verma",
    password: "password123",
    role: "user"
  },
  {
    email: "anjali.gupta@gmail.com",
    firstName: "Anjali",
    lastName: "Gupta",
    password: "password123",
    role: "user"
  },
  {
    email: "vikram.reddy@gmail.com",
    firstName: "Vikram",
    lastName: "Reddy",
    password: "password123",
    role: "user"
  },
  {
    email: "kavitha.nair@gmail.com",
    firstName: "Kavitha",
    lastName: "Nair",
    password: "password123",
    role: "user"
  },
  {
    email: "arjun.mehta@gmail.com",
    firstName: "Arjun",
    lastName: "Mehta",
    password: "password123",
    role: "user"
  },
  {
    email: "deepa.joshi@gmail.com",
    firstName: "Deepa",
    lastName: "Joshi",
    password: "password123",
    role: "user"
  }
];

async function seedUsers() {
  console.log("Starting to seed users...");
  
  try {
    // Insert users
    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [user] = await db
        .insert(users)
        .values({
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isVerified: true // Set as verified for testing
        })
        .returning();
      
      console.log(`Created user: ${user.email}`);
      
      // Create a profile for each user
      await db
        .insert(profiles)
        .values({
          userId: user.id,
          name: `${userData.firstName} ${userData.lastName}`,
          relation: "self",
          pan: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`, // Random PAN
          dateOfBirth: `${1970 + Math.floor(Math.random() * 30)}-${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, '0')}`,
          address: `${Math.floor(1 + Math.random() * 999)}, Sample Street, Mumbai, Maharashtra`,
          isActive: true
        });
      
      console.log(`Created profile for: ${user.email}`);
    }
    
    console.log("Successfully seeded 10 dummy users!");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
  
  process.exit(0);
}

seedUsers();
