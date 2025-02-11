import { applicationController } from "../../controllers/application.controller.js";
import { Application } from "../../models/application.model.js";
import { mockApplications } from "../fixtures/application.fixture.js";

jest.mock('../../middlewares/auth.middleware.js', () => ({
    checkRole: () => (req, res, next) => {
        req.uid = "mock-firebase-uid"; // Attach mock user ID to request
        next();
    }
}));

describe("Application Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        jobId: mockApplications[0].job,
        coverLetter: mockApplications[0].coverLetter,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  //  Test: Applying for a Job
  describe("apply", () => {
    it("should create a new application and return 201", async () => {
      Application.create = jest.fn().mockResolvedValue(mockApplications[0]);

      await applicationController.apply(req, res);

      expect(Application.create).toHaveBeenCalledWith(expect.objectContaining({
        job: req.body.jobId,
        coverLetter: req.body.coverLetter,
      }));

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Application started successfully",
      }));
    });

    it("should return 500 if an error occurs", async () => {
      Application.create = jest.fn().mockRejectedValue(new Error("Database error"));

      await applicationController.apply(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error submitting application",
      }));
    });
  });

  //  Test: Retrieving an Application
  describe("getApplication", () => {
    it("should return an application if found", async () => {
      req.params = { jobId: mockApplications[0].job, userId: mockApplications[0].applicant };

      Application.findOne = jest.fn().mockResolvedValue(mockApplications[0]);

      await applicationController.getApplication(req, res);

      expect(Application.findOne).toHaveBeenCalledWith({
        job: req.params.jobId,
        applicant: req.params.userId,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Application retrieved successfully",
      }));
    });

    it("should return 404 if application not found", async () => {
      req.params = { jobId: "nonexistent", userId: "unknown" };

      Application.findOne = jest.fn().mockResolvedValue(null);

      await applicationController.getApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Application not found",
      }));
    });

    it("should return 500 if an error occurs", async () => {
      req.params = { jobId: "error", userId: "error" };

      Application.findOne = jest.fn().mockRejectedValue(new Error("Database failure"));

      await applicationController.getApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error retrieving application",
      }));
    });
  });
});