import request from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";
import { jest } from "@jest/globals";
import { JobSeeker } from "../../models/user/jobSeeker.model.js";
import { mockUser } from "../fixtures/user.fixture.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../../models/user/user.model.js";
import { checkRole } from "../../middlewares/auth.middleware.js";

jest.mock('../../middlewares/auth.middleware.js', () => ({
    checkRole: () => (req, res, next) => {
        console.log("Mock middleware called-------------------------------------");
        req.uid = "mock-firebase-uid"; // Attach mock user ID to request
        next();
    }
}));

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    // Create a test user in the database
    await JobSeeker.create(mockUser);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

describe("GET /api/user/role", () => {
    test("Should respond with 200 and return the user's role", async () => {
        
        User.findOne = jest.fn().mockResolvedValue(mockUser);

        const response = await request(app)
            .get("/api/user/role")
            .set('Authorization', 'Bearer mockToken');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data", mockUser.role);
    });

    test("Should return 500 if user is not found", async () => {
        // Mock User.findById to return null
        //JobSeeker.findOne.mockResolvedValueOnce(null);
        User.findOne = jest.fn().mockResolvedValueOnce(null);

        const response = await request(app)
            .get("/api/user/role")
            .set('Authorization', 'Bearer mockToken');

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message", "No user found with this ID");
    });
});
