import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { seedTestDatabase, clearDatabase } from "./testUtils/index.js"; // Import the seed and clear functions

let mongoServer; // Variable to hold the in-memory MongoDB instance

// Runs once before all tests start
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create(); // Create an in-memory MongoDB server
  const uri = mongoServer.getUri(); // Get the database URI

  // Connect Mongoose to the in-memory database
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  await seedTestDatabase(); // Seed the database with test data
});

// Runs before each test to reset the database state
beforeEach(async () => {
  await clearDatabase(); // Clear existing test data
  await seedTestDatabase(); // Reload fresh test data
});

// Runs once after all tests finish
afterAll(async () => {
  await mongoose.connection.close(); // Close the database connection
  await mongoServer.stop(); // Stop the in-memory MongoDB instance
});
