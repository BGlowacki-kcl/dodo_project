import request from "supertest";
import { app } from "../../app.js";
import { jest } from "@jest/globals";
import { mockUser } from "../fixtures/user.fixture.js";
import User from "../../models/user/user.model.js";

// Override middleware function
jest.mock('../../middlewares/auth.middleware.js', () => ({
    checkRole: () => (req, res, next) => {
        req.uid = "mock-firebase-uid"; // Attach mock user ID to request
        next();
    }
}));


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
