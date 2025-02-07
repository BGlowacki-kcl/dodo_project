import mongoose from "mongoose";
import "dotenv/config";
import User from "./backend/models/user/user.model.js";
import Job from "./backend/models/job.model.js";
import Application from "./backend/models/application.model.js";



// 🔹 Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
    process.exit(1);
  }
};

// 🔹 Updated Sample Data (Includes `role` and `uid`)
const users = [
  { name: "John Doe", email: "john@example.com", password: "123456", role: "employer", uid: "user123" },
  { name: "Jane Smith", email: "jane@example.com", password: "654321", role: "jobSeeker", uid: "user456" },
];

await connectDB();

const existingUsers = await User.find();

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
    postedBy: existingUsers[0]._id 
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
    postedBy: existingUsers[1]._id
  },
];

// 🔹 Seed Function
const seedDatabase = async () => {
  try {
    await connectDB();

    // 🧹 Delete existing data
    await Application.deleteMany();
    await Job.deleteMany();
    await User.deleteMany();
    console.log("🗑️ Existing data deleted");


    const existingUsers = await User.find();
    

    // 🟢 Insert Users
    const createdUsers = await User.insertMany(users);
    console.log("✅ Users seeded");

    // 🟢 Insert Jobs
    const createdJobs = await Job.insertMany(jobs);
    console.log("✅ Jobs seeded");

    if (!createdUsers.length || !createdJobs.length) {
      console.error("❌ Seeding error: No users or jobs found.");
      process.exit(1);
    }

    // 🟢 Insert Applications
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
    console.log("✅ Applications seeded");

    mongoose.connection.close();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// 🚀 Run Seeder
seedDatabase();




