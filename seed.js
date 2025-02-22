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

// Fixed list of companies
const techCompanies = [
    {
        uid: faker.string.uuid(),
        email: "careers@google.com",
        role: "employer",
        name: "Google",
        companyName: "Google",
        companyWebsite: "https://careers.google.com",
        companyDescription: "A global leader in search engines, advertising, and cloud computing."
    },
    {
        uid: faker.string.uuid(),
        email: "careers@meta.com",
        role: "employer",
        name: "Meta",
        companyName: "Meta",
        companyWebsite: "https://www.metacareers.com",
        companyDescription: "Connecting people and communities through social media platforms."
    },
    {
        uid: faker.string.uuid(),
        email: "careers@amazon.com",
        role: "employer",
        name: "Amazon",
        companyName: "Amazon",
        companyWebsite: "https://www.amazon.jobs",
        companyDescription: "World's largest e-commerce and cloud computing company."
    },
    {
        uid: faker.string.uuid(),
        email: "careers@apple.com",
        role: "employer",
        name: "Apple",
        companyName: "Apple",
        companyWebsite: "https://www.apple.com/careers",
        companyDescription: "Innovator in consumer electronics, software, and online services."
    },
    {
        uid: faker.string.uuid(),
        email: "careers@microsoft.com",
        role: "employer",
        name: "Microsoft",
        companyName: "Microsoft",
        companyWebsite: "https://careers.microsoft.com",
        companyDescription: "A leader in software, cloud computing, and enterprise solutions."
    },
    {
        uid: faker.string.uuid(),
        email: "careers@netflix.com",
        role: "employer",
        name: "Netflix",
        companyName: "Netflix",
        companyWebsite: "https://jobs.netflix.com",
        companyDescription: "Leading streaming entertainment service with global reach."
    },
    {
        uid: faker.string.uuid(),
        email: "careers@tesla.com",
        role: "employer",
        name: "Tesla",
        companyName: "Tesla",
        companyWebsite: "https://www.tesla.com/careers",
        companyDescription: "Electric vehicles, clean energy solutions, and AI-driven automation."
    },
    {
        uid: faker.string.uuid(),
        email: "careers@spacex.com",
        role: "employer",
        name: "SpaceX",
        companyName: "SpaceX",
        companyWebsite: "https://www.spacex.com/careers",
        companyDescription: "Revolutionizing space transportation and exploration."
    }
];

// Generate Random Employers
const generateRandomEmployers = (num) => {
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

const generateEmployers = (num) => {
    const randomEmployers = generateRandomEmployers(num);
    return [...techCompanies, ...randomEmployers];
}

// Tech job titles
const techJobTitles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Data Engineer",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Cloud Architect",
    "Cybersecurity Analyst",
    "Mobile App Developer",
    "Product Manager",
    "UI/UX Designer",
    "Blockchain Developer",
    "AR/VR Developer",
    "SWE Summer Intern",
    "Research Developer"
];

const techJobDetails = {
    "Software Engineer": "Develop scalable software applications, collaborate with cross-functional teams, and maintain code quality using best practices.",
    "Frontend Developer": "Design and implement user-facing features using modern frontend frameworks such as React and Angular.",
    "Backend Developer": "Build robust server-side logic, APIs, and manage database integrations to support scalable applications.",
    "Full Stack Developer": "Develop full-stack applications with a strong focus on both frontend and backend functionality.",
    "Data Scientist": "Analyze complex data sets to extract actionable insights, build predictive models, and collaborate with business stakeholders.",
    "Data Engineer": "Design and maintain data pipelines, optimize data storage solutions, and ensure high data quality and availability.",
    "Machine Learning Engineer": "Build and deploy machine learning models, fine-tune algorithms, and work with large-scale data sets.",
    "DevOps Engineer": "Automate CI/CD pipelines, manage cloud infrastructure, and ensure high availability and security of applications.",
    "Cloud Architect": "Design and implement cloud solutions using platforms like AWS, Azure, or GCP to optimize scalability and cost efficiency.",
    "Cybersecurity Analyst": "Monitor and secure networks, perform vulnerability assessments, and implement security best practices.",
    "Mobile App Developer": "Develop mobile applications for iOS and Android platforms using Swift, Kotlin, or React Native.",
    "Product Manager": "Define product requirements, work closely with development teams, and ensure timely delivery of product features.",
    "UI/UX Designer": "Create user-centric designs, conduct user research, and ensure a seamless user experience across digital platforms.",
    "Blockchain Developer": "Build decentralized applications, implement smart contracts, and ensure security and performance on blockchain networks.",
    "AR/VR Developer": "Develop immersive AR/VR experiences, optimize 3D graphics, and work with platforms like Unity or Unreal Engine.",
    "SWE Summer Intern" : "Collaborate with engineering teams to develop software solutions, participate in code reviews, and learn from senior engineers. Gain hands-on experience with coding, debugging, and version control systems. Contribute to real-world projects and present findings to cross-functional teams.",
    "Research Developer" : "Work with researchers and data scientists to design and develop innovative prototypes. Conduct exploratory data analysis, build proof-of-concept solutions, and contribute to research publications. Collaborate on algorithm development and stay up-to-date with emerging technologies."
};

// Tech skills and requirements
const techSkills = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "React",
    "Node.js",
    "SQL",
    "NoSQL",
    "Machine Learning",
    "Deep Learning",
    "AWS",
    "Azure",
    "GCP",
    "Kubernetes",
    "Docker",
    "Cybersecurity",
    "Blockchain"
];

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
            status: faker.helpers.arrayElement(['applying', 'applied', 'in review', 'shortlisted', 'rejected', 'accepted']),
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
      const employers = generateEmployers(10); // Generate 20 employers

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





