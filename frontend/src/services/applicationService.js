// FAKEDATAHERE NEED TO REPLACE WITH UPDATED BACKEND
let FAKE_APPLICATIONS = [
    {
      _id: "app1",
      job: {
        _id: "job1",
        title: "Software Engineer",
        description: "Develop cutting-edge applications",
      },
      applicant: "user1",
      status: "applied",
      coverLetter: "Hello, I'm interested in this position!",
      submittedAt: "2025-01-01T10:00:00Z",
    },
    {
      _id: "app2",
      job: {
        _id: "job2",
        title: "Data Scientist",
        description: "Analyze data for insights",
      },
      applicant: "user1",
      status: "in review",
      coverLetter: "I would love to work on data challenges!",
      submittedAt: "2025-01-10T09:30:00Z",
    },
  ];
  
let FAKE_JOBS = [
    {
      _id: "job1",
      title: "Software Engineer",
      description: "Develop cutting-edge applications",
      requirements: ["JavaScript", "React"],
      location: "New York",
    },
    {
      _id: "job2",
      title: "Data Scientist",
      description: "Analyze data for insights",
      requirements: ["Python", "Machine Learning"],
      location: "Remote",
    },
];
  
export async function getAllUserApplications(userId) {
    return FAKE_APPLICATIONS.filter((app) => app.applicant === userId);
}
export async function getApplicationById(appId) {
    return FAKE_APPLICATIONS.find((app) => app._id === appId);
}
  
export async function applyToJob({ jobId, userId, coverLetter }) {
    const newApp = {
      _id: "app" + (FAKE_APPLICATIONS.length + 1),
      job: FAKE_JOBS.find((job) => job._id === jobId),
      applicant: userId,
      coverLetter,
      status: "applied",
      submittedAt: new Date().toISOString(),
    };
    FAKE_APPLICATIONS.push(newApp);
    return newApp;
  }
export async function withdrawApplication(appId) {
    const idx = FAKE_APPLICATIONS.findIndex((app) => app._id === appId);
    if (idx !== -1) {
      FAKE_APPLICATIONS.splice(idx, 1);
      return { success: true };
    }
    return { success: false };
}
  
export async function getAllJobs() {
    return FAKE_JOBS;
}