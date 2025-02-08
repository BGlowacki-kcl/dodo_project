import mongoose from "mongoose";
import "dotenv/config";
import admin from "firebase-admin"; //  Import Firebase Admin SDK
import User from "./backend/models/user/user.model.js";
import Job from "./backend/models/job.model.js";
import Application from "./backend/models/application.model.js";

//  Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert("./backend/config/dodo-project-42d5c-firebase-adminsdk-fbsvc-cd1e51381e.json"), // Make sure this file exists
});

//  Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected");
  } catch (error) {
    console.error(" DB Connection Error:", error);
    process.exit(1);
  }
};

//  Fetch Users from Firebase Auth
const fetchFirebaseUsers = async () => {
  try {
    const listUsers = async (nextPageToken) => {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      const users = result.users.map((user) => ({
        uid: user.uid, // Firebase UID
        name: user.displayName || "Anonymous",
        email: user.email || "",
        role: "jobSeeker", // Default role
      }));

      return users;
    };

    return await listUsers();
  } catch (error) {
    console.error(" Firebase fetch error:", error);
    return [];
  }
};

//  Seed Database
const seedDatabase = async () => {
  try {
    await connectDB();

    //  Delete existing data
    await Application.deleteMany();
    await Job.deleteMany();
    await User.deleteMany();
    console.log(" Existing data deleted");

    //  Fetch users from Firebase
    const firebaseUsers = await fetchFirebaseUsers();
    if (!firebaseUsers.length) {
      console.log("⚠️ No Firebase users found. Seeding default users.");
      firebaseUsers.push(
        { name: "John Doe", email: "john@example.com", role: "employer", uid: "user123" },
        { name: "Jane Smith", email: "jane@example.com", role: "jobSeeker", uid: "user456" }
      );
    }

    //  Insert Users
    const createdUsers = await User.insertMany(firebaseUsers);
    console.log(` ${createdUsers.length} Users seeded`);

    //  Insert Jobs
    const jobs = [
      {
        title: "Software Engineer",
        company: "TechCorp",
        location: "San Francisco",
        description: "Develop and maintain software applications.",
        salaryRange: { min: 100000, max: 150000 },
        employmentType: ["full-time"],
        requirements: ["JavaScript", "Node.js"],
        experienceLevel: "mid",
        postedBy: createdUsers[0]._id, //  Ensure correct user ID
      },
      {
        title: "Product Manager",
        company: "BizWorld",
        location: "New York",
        description: "Manage product development and strategy.",
        salaryRange: { min: 90000, max: 120000 },
        employmentType: ["full-time"],
        requirements: ["Product Management", "Agile"],
        experienceLevel: "senior",
        postedBy: createdUsers[1]._id, //  Ensure correct user ID
      },
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log(" Jobs seeded");

    //  Insert Applications
    const applications = [
      {
        job: createdJobs[0]._id,
        applicant: createdUsers[0]._id,
        status: "applied",
        coverLetter: "I am very interested in this role.",
      },
      {
        job: createdJobs[1]._id,
        applicant: createdUsers[1]._id,
        status: "in review",
        coverLetter: "Excited to apply for this position.",
      },
    ];

    await Application.insertMany(applications);
    console.log(" Applications seeded");

    mongoose.connection.close();
    console.log(" Database connection closed");
  } catch (error) {
    console.error("Seeding error:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

//  Run Seeder
seedDatabase();





