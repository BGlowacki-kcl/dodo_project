import mongoose from "mongoose";
import "dotenv/config";
import { faker } from "@faker-js/faker";
import admin from "firebase-admin";
import User from "./backend/models/user/user.model.js";
import { JobSeeker } from "./backend/models/user/jobSeeker.model.js";
import { Employer } from "./backend/models/user/Employer.model.js";
import Job from "./backend/models/job.model.js";
import Application from "./backend/models/application.model.js";

import { generateCV } from "./backend/fixtures/cvTemplate.js";
import { generateCoverLetter } from "./backend/fixtures/coverLetTemplate.js";
import { locations } from "./backend/fixtures/locationFixtures.js";
import { universityNames, degreeTitles, fieldsOfStudy } from "./backend/fixtures/educationFixtures.js";
import { techCompanies, techJobDetails, techSkills } from "./backend/fixtures/companyFixtures.js";

//TODO: Seed Cover letter under application, Refine CV generation, Seed sample user


//  Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert("./backend/config/dodo-project-42d5c-firebase-adminsdk-fbsvc-14414f6ab9.json"), // Make sure this file exists
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

// Create user in Firebase
const createFirebaseUser = async (email, password, displayName) => {
    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: displayName
        });
        return userRecord.uid;
    } catch (error) {
        console.error("Error creating Firebase user:", error);
        return null;
    }
};

const generateEducation = () => {
    return {
        institution: faker.helpers.arrayElement(universityNames),
        degree: faker.helpers.arrayElement(degreeTitles),
        fieldOfStudy: faker.helpers.arrayElement(fieldsOfStudy),
        startDate: faker.date.past(5),
        endDate: faker.date.recent(2),
    };
};

const PASSWORD = "Password123";

// Generate Random JobSeekers
const generateJobSeekers = async (num) => {
    const jobSeekers = [];

    for (let i = 0; i < num; i++) {
        const name = faker.person.fullName();
        const email = faker.internet.email({ fistName: name });
        const firebaseUid = await createFirebaseUser(email, PASSWORD, name);
        if (!firebaseUid) continue;
        const education = generateEducation();
        const skills = faker.helpers.arrayElement(techSkills, 5);
        const experience = {
            company: faker.company.name(),
            title: faker.person.jobTitle(),
            startDate: faker.date.past(2),
            endDate: faker.date.recent(1),
            description: faker.lorem.sentences(2),
        };
        jobSeekers.push(new JobSeeker({
            uid: firebaseUid,
            email: email,
            role: "jobSeeker",
            name: name,
            location: faker.helpers.arrayElement(locations),
            education: [education],
            experience: [experience],
            skills: [skills],
            resume: generateCV(name, [education], [experience], email, [skills])
        }));
    }

    return jobSeekers;
};

const generateEmployers =  async () => {
    const employers = [];
    for (const company of techCompanies) {
        const firebaseUid = await createFirebaseUser(company.email, PASSWORD, company.name);
        if (!firebaseUid) continue;

        employers.push(new Employer({
            uid: firebaseUid,
            email: company.email,
            role: "employer",
            name: company.name,
            companyName: company.companyName,
            companyWebsite: company.companyWebsite,
            companyDescription: company.companyDescription,
        }));
    }

    return employers;
}

// Generate Random Jobs
const generateJobs = (num, employers) => {
    const jobs = [];

    for (let i = 0; i < num; i++) {
        const employer = faker.helpers.arrayElement(employers);
        const jobTitle = faker.helpers.arrayElement(Object.keys(techJobDetails));

        jobs.push({
            title: jobTitle,
            company: employer.companyName,
            location: faker.location.city(),
            description: techJobDetails[jobTitle],
            salaryRange: {
                min: faker.number.int({ min: 30000, max: 60000 }),
                max: faker.number.int({ min: 80000, max: 150000 })
            },
            employmentType: faker.helpers.arrayElement(["full-time", "part-time", "internship", "contract"]),
            requirements: faker.helpers.arrayElement(techSkills),
            experienceLevel: faker.helpers.arrayElement(["entry", "mid", "senior"]),
            postedBy: employer._id,
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
            status: faker.helpers.arrayElement(['applying', 'applied', 'in review', 'shortlisted', 'rejected', 'accepted']),
            coverLetter: generateCoverLetter(jobSeeker.name, job.title, job.company, jobSeeker.skills, jobSeeker.email)
        });
    }

    return applications;
};

// Code to wipe firebase user authentication record, use carefully, not reversible
const deleteUsersInBatch = async (uids) => {
    try {
        const result = await admin.auth().deleteUsers(uids);
        console.log(`${result.successCount} users deleted, ${result.failureCount} failed`);
        if (result.failureCount > 0) {
            console.log(result.errors);
        }
    } catch (error) {
        console.error("Batch deletion error:", error);
    }
};


const deleteAllFirebaseUsers = async () => {
    try {
        let nextPageToken;
        do {
            // List up to 1000 users at a time
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            const uids = listUsersResult.users.map(user => user.uid);
            if (uids.length > 0) {
                await deleteUsersInBatch(uids);
                // Wait 60 seconds before deleting the next batch
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        console.log("All users processed.");
    } catch (error) {
        console.error("Error deleting Firebase users:", error);
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
    await JobSeeker.deleteMany();
    await Employer.deleteMany();
    console.log("Existing data deleted");

    // await deleteAllFirebaseUsers();
    // console.log("Deleted firebase records");

      const jobSeekers = await generateJobSeekers(100); // Generate 100 jobseekers
      const employers = await generateEmployers();

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
      console.log("Applications added...");


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





