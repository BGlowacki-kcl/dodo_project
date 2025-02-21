import mongoose from "mongoose";
import "dotenv/config";
import { faker } from "@faker-js/faker";
import admin from "firebase-admin"; //  Import Firebase Admin SDK
import User from "./backend/models/user/user.model.js";
import { JobSeeker } from "./backend/models/user/jobSeeker.model.js";
import { Employer } from "./backend/models/user/Employer.model.js";
import Job from "./backend/models/job.model.js";
import Application from "./backend/models/application.model.js";

//  Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert("./backend/config/dodo-project-42d5c-firebase-adminsdk-fbsvc-cd1e51381e.json"), // Make sure this file exists
// });

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
// const fetchFirebaseUsers = async () => {
//   try {
//     const listUsers = async (nextPageToken) => {
//       const result = await admin.auth().listUsers(1000, nextPageToken);
//       const users = result.users.map((user) => ({
//         uid: user.uid, // Firebase UID
//         name: user.displayName || "Anonymous",
//         email: user.email || "",
//         role: "jobSeeker", // Default role
//       }));
//
//       return users;
//     };
//
//     return await listUsers();
//   } catch (error) {
//     console.error(" Firebase fetch error:", error);
//     return [];
//   }
// };

const universityNames = [
    "King's College London",
    "Imperial College London",
    "Harvard University",
    "Stanford University",
    "University of Oxford",
    "Massachusetts Institute of Technology",
    "University of Cambridge",
    "California Institute of Technology",
    "University of Chicago",
    "Princeton University",
    "Yale University",
    "University of California, Berkeley",
    `${faker.company.name()} University`
];


const generateEducation = () => {
    return {
        institution: faker.helpers.arrayElement(universityNames),
        degree: faker.helpers.arrayElement(degreeTitles),
        fieldOfStudy: faker.helpers.arrayElement(fieldsOfStudy),
        startDate: faker.date.past(5),
        endDate: faker.date.recent(2),
    };
};

const degreeTitles = [
    "Bachelor of Science (BSc)",
    "Bachelor of Arts (BA)",
    "Master of Science (MSc)",
    "Master of Business Administration (MBA)",
    "Doctor of Philosophy (PhD)"
];

const fieldsOfStudy = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Business Administration",
    "Economics",
    "Physics",
    "Mathematics",
    "Biology",
    "Chemistry",
    "Political Science",
    "Psychology",
    "Sociology"
];

// Generate Random JobSeekers
const generateJobSeekers = (num) => {
    const jobSeekers = [];

    for (let i = 0; i < num; i++) {
        jobSeekers.push({
            uid: faker.string.uuid(), // Fixed from datatype.uuid()
            email: faker.internet.email(),
            role: "jobSeeker",
            name: faker.person.fullName(), // Fixed from name.findName()
            location: faker.location.city(),
            education: [generateEducation()],
            experience: [
                {
                    company: faker.company.name(), // Fixed from companyName()
                    title: faker.person.jobTitle(),
                    startDate: faker.date.past(2),
                    endDate: faker.date.recent(1),
                    description: faker.lorem.sentences(2),
                }
            ],
            skills: faker.lorem.words(5).split(" "),
            resume: faker.internet.url()
        });
    }

    return jobSeekers;
};

// Generate Random Employers
const generateEmployers = (num) => {
  const employers = [];

  for (let i = 0; i < num; i++) {
    employers.push({
      uid: faker.string.uuid(),
      email: faker.internet.email(),
      role: "employer",
      name: faker.company.name(),
      companyName: faker.company.name(),
      companyWebsite: faker.internet.url(),
      companyDescription: faker.company.catchPhrase(),
    });
  }

  return employers;
};

// Generate Random Jobs
const generateJobs = (num, employers) => {
    const jobs = [];

    for (let i = 0; i < num; i++) {
        const employer = faker.helpers.arrayElement(employers);

        jobs.push({
            title: faker.person.jobTitle(),
            company: employer.companyName,
            location: faker.location.city(),
            description: faker.lorem.sentences(3),
            salaryRange: {
                min: faker.number.int({ min: 30000, max: 80000 }),
                max: faker.number.int({ min: 80001, max: 150000 })
            },
            employmentType: faker.helpers.arrayElement(["full-time", "part-time", "contract"]),
            requirements: faker.lorem.words(5).split(" "),
            experienceLevel: faker.helpers.arrayElement(["entry", "mid", "senior"]),
            postedBy: employer._id, // Link to employer who posted the job
        });
    }

    return jobs;
};

// Generate Random Applications
const generateApplications = (num, jobSeekers, jobs) => {
    const applications = [];

    for (let i = 0; i < num; i++) {
        const job = faker.helpers.arrayElement(jobs);
        const jobSeeker = faker.helpers.arrayElement(jobSeekers);

        applications.push({
            job: job._id,
            applicant: jobSeeker._id,
            status: faker.helpers.arrayElement(["applied", "in review", "rejected", "accepted"]),
            coverLetter: faker.lorem.sentences(2)
        });
    }

    return applications;
};

//  Seed Database
const seedDatabase = async () => {
  try {
    await connectDB();

    //  Delete existing data
    await Application.deleteMany();
    await Job.deleteMany();
    await User.deleteMany();
    await JobSeeker.deleteMany();
    await Employer.deleteMany();
    console.log(" Existing data deleted");

    //  Fetch users from Firebase
    // const firebaseUsers = await fetchFirebaseUsers();
    // if (!firebaseUsers.length) {
    //   console.log("⚠️ No Firebase users found. Seeding default users.");
    //   firebaseUsers.push(
    //       { name: "John Doe", email: "john@example.com", role: "employer", uid: "user123" },
    //       { name: "Jane Smith", email: "jane@example.com", role: "jobSeeker", uid: "user456" }
    //   );
    // }

      const jobSeekers = generateJobSeekers(100); // Generate 100 jobseekers
      const employers = generateEmployers(20); // Generate 20 employers

      const createdJobSeekers = await JobSeeker.insertMany(jobSeekers);
      console.log("JobSeekers added...");

      const createdEmployers = await Employer.insertMany(employers);
      console.log("Employers added...");

      // Generate and insert Jobs
      const jobs = generateJobs(200, createdEmployers); // 200 Jobs
      const createdJobs = await Job.insertMany(jobs);
      console.log("Jobs added...");

      // Generate and insert Applications
      const applications = generateApplications(300, createdJobSeekers, createdJobs); // 300 Applications
      await Application.insertMany(applications);
      console.log("📄 Applications added...");


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





