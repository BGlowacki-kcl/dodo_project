import { Application } from "../../models/application.model.js"; 
import applicationData from "../fixtures/application.fixture.json";

// Function to seed the database with application test data
export const seedApplicationData = async () => {
  await Application.deleteMany({}); // Clear existing application data
  await Application.insertMany(applicationData); // Insert predefined test data from fixtures
};

// Function to clear application data (used before or after tests)
export const clearApplicationData = async () => {
  await Application.deleteMany({}); // Remove all application records
};