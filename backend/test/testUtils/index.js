import { seedApplicationData, clearApplicationData } from "./application.utils.js";

// seeding for testing
export const seedTestDatabase = async () => {
  await seedApplicationData(); // Add more models 
};

// clearing for testing
export const clearDatabase = async () => {
  await clearApplicationData(); // Add more models
};