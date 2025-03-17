/**
 * applicationController.test.js
 * 
 * This updated test file matches your actual applicationController,
 * using "createApplication" (instead of "apply"), "withdrawApplication" (instead of "cancel"),
 * "req.query" in the right places, etc., ensuring higher coverage.
 */

import { applicationController } from "../../controllers/application.controller.js";
import Application from "../../models/application.model.js";
import Job from "../../models/job.model.js";
import User from "../../models/user/user.model.js";  // So we can mock .findOne
import { mockApplications } from "../fixtures/application.fixture.js";

jest.mock('../../middlewares/auth.middleware.js', () => ({
  checkRole: () => (req, res, next) => {
    // typical mock: attach a mock user ID to request
    req.uid = "mock-firebase-uid";
    next();
  }
}));

describe("applicationController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      uid: "mock-firebase-uid", // typically how the controller reads user
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // CREATE APPLICATION (controller method: createApplication)
  // ----------------------------------------------------------------
  describe("createApplication", () => {
    it("should return 400 if missing jobId", async () => {
      // code checks `if (!jobId) return 400;`
      req.body = { jobId: null, coverLetter: "some cover letter" };
      // no user in DB
      await applicationController.createApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Missing jobId in body",
        })
      );
    });

    it("should create a new application (201) if valid", async () => {
      // the controller finds the user: User.findOne({ uid })
      // so we must mock the user
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });

      // the request
      req.body = {
        jobId: "job123",
        coverLetter: "cover",
      };
      req.uid = "mock-firebase-uid";

      // when we call Application.create, we want it to return a new doc
      // the code then does newApp.populate("job")
      const mockApp = {
        populate: jest.fn().mockResolvedValue({
          _id: "newAppId",
          job: "job123",
        }),
      };
      Application.create = jest.fn().mockResolvedValue(mockApp);

      await applicationController.createApplication(req, res);

      // check the create call
      expect(Application.create).toHaveBeenCalledWith({
        job: "job123",
        applicant: "someUserId",
        coverLetter: "cover",
        status: "applied",
      });

      // check we populated the job
      expect(mockApp.populate).toHaveBeenCalledWith("job");

      // check final response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Application created",
        })
      );
    });

    it("should return 500 if DB error", async () => {
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      req.body = { jobId: "job456", coverLetter: "any letter" };

      // DB throws error
      Application.create = jest.fn().mockRejectedValue(new Error("DB error"));

      await applicationController.createApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "DB error", // from the actual error message
        })
      );
    });
  });

  // ----------------------------------------------------------------
  // GET APPLICATION (controller method: getApplication)
  // ----------------------------------------------------------------
  describe("getApplication", () => {
    it("should return an application if found", async () => {
      // code uses req.params.jobId, and app is found by job + applicant
      req.params = { jobId: "job123" };
      req.uid = "mock-uid-user";
      // mock the findOne
      const mockApp = { _id: "someAppId" };
      Application.findOne = jest.fn().mockResolvedValue(mockApp);

      await applicationController.getApplication(req, res);

      expect(Application.findOne).toHaveBeenCalledWith({
        job: "job123",
        applicant: "mock-uid-user",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Application retrieved successfully",
        })
      );
    });

    it("should return 404 if app not found", async () => {
      req.params = { jobId: "nonexistent" };
      req.uid = "mock-uid-user";

      Application.findOne = jest.fn().mockResolvedValue(null);

      await applicationController.getApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Application not found",
        })
      );
    });

    it("should return 500 if a DB error occurs", async () => {
      req.params = { jobId: "error" };
      req.uid = "mock-uid-user";

      Application.findOne = jest.fn().mockRejectedValue(new Error("Database failure"));

      await applicationController.getApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Database failure",
        })
      );
    });
  });

  // ----------------------------------------------------------------
  // UPDATE APPLICATION STATUS (controller method: updateApplicationStatus)
  // ----------------------------------------------------------------
  describe("updateApplicationStatus", () => {
    it("should return 400 if status is invalid", async () => {
      req.params = { id: "someAppId" };
      req.body = { status: "unknown" }; // not in valid list

      await applicationController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid application status",
      });
    });

    it("should return 404 if app not found", async () => {
      req.params = { id: "someAppId" };
      req.body = { status: "applied" };
      // findById => .populate("job") => let's mock that chain
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await applicationController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Application not found",
      });
    });

    it("should update status + return 200 if found & authorized", async () => {
      req.params = { id: "someAppId" };
      req.body = { status: "applied" };
      req.uid = "employer-uid"; // code checks postedBy matches this

      const mockApp = { _id: "someAppId", save: jest.fn(), job: "mockJobId" };
      // chain
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });
      // next the code calls Job.findById(application.job)
      Job.findById = jest.fn().mockResolvedValue({ postedBy: "employer-uid" });

      await applicationController.updateApplicationStatus(req, res);

      expect(mockApp.status).toBe("applied");
      expect(mockApp.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Application status updated successfully",
        })
      );
    });

    it("should return 403 if the employer is not the one who posted the job", async () => {
      // The code checks postedBy != req.uid => 403
      req.params = { id: "someAppId" };
      req.body = { status: "applied" };
      req.uid = "someone-else-uid";

      const mockApp = { _id: "someAppId", save: jest.fn(), job: "mockJobId" };
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });
      // job postedBy is "employer-uid" but we have "someone-else-uid"
      Job.findById = jest.fn().mockResolvedValue({ postedBy: "employer-uid" });

      await applicationController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized to update application status",
      });
    });

    it("should return 500 on DB error", async () => {
      req.params = { id: "errorId" };
      req.body = { status: "applied" };
      // we simulate an error
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      await applicationController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "DB error", // from the actual thrown error
        })
      );
    });
  });

  // ----------------------------------------------------------------
  // GET APPLICANTS (controller method: getApplicants)
  // ----------------------------------------------------------------
  describe("getApplicants", () => {
    it("should return a list of applicants (200)", async () => {
      req.params = { jobId: "someJobId" };
      // code calls Job.findById(jobId)
      Job.findById = jest.fn().mockResolvedValue({ _id: "someJobId" });

      const mockApp = {
        applicant: { _id: "userId", name: "TestUser", email: "test@user.com" },
      };
      // code calls Application.find({ job: jobId }).populate("applicant", "name email")
      Application.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockApp]),
      });

      await applicationController.getApplicants(req, res);

      expect(Application.find).toHaveBeenCalledWith({ job: "someJobId" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Applicants retrieved successfully",
        })
      );
    });

    it("should return 403 if no job found", async () => {
      req.params = { jobId: "invalidJobId" };
      // code checks if (!job) => 403
      Job.findById = jest.fn().mockResolvedValue(null);

      await applicationController.getApplicants(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Unauthorized to view applicants for this job",
        })
      );
    });

    it("should return 500 on error", async () => {
      req.params = { jobId: "errJob" };
      // Job.findById => throw an error
      Job.findById = jest.fn().mockRejectedValue(new Error("DB error"));

      await applicationController.getApplicants(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "DB error",
        })
      );
    });
  });

  // ----------------------------------------------------------------
  // GET ALL APPLICATIONS (controller method: getAllApplications)
  // ----------------------------------------------------------------
  describe("getAllApplications", () => {
    it("should fetch apps for the user in req.uid", async () => {
      // The code does:
      // const user = await User.findOne({ uid: uid });
      // const filter = { applicant: user._id };
      // const apps = await Application.find(filter).populate("job");
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Application.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApplications),
      });

      req.uid = "mock-firebase-uid";
      await applicationController.getAllApplications(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ uid: "mock-firebase-uid" });
      expect(Application.find).toHaveBeenCalledWith({ applicant: "someUserId" });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Applications fetched",
        })
      );
    });

    it("should return 500 on error", async () => {
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Application.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      await applicationController.getAllApplications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "DB error",
        })
      );
    });
  });

  // ----------------------------------------------------------------
  // GET ONE APPLICATION (controller method: getOneApplication)
  // ----------------------------------------------------------------
  describe("getOneApplication", () => {
    it("should return 404 if not found", async () => {
      // code uses { id } from req.query
      req.query = { id: "someId" };
      req.uid = "mockUserUid";

      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      // findById => populate => return null => 404
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await applicationController.getOneApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Application not found",
        })
      );
    });

    it("should return 403 if the user does not own the app", async () => {
      req.query = { id: "someId" };
      req.uid = "mockUserUid";

      // user => _id = "otherUserId"
      User.findOne = jest.fn().mockResolvedValue({ _id: "otherUserId" });
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: "someId",
          applicant: "someoneElseId",
        }),
      });

      await applicationController.getOneApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Unauthorized",
        })
      );
    });

    it("should return 200 + app doc if found and user matches", async () => {
      req.query = { id: "someId" };
      req.uid = "mockUserUid";

      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: "someId",
          applicant: "someUserId",
        }),
      });

      await applicationController.getOneApplication(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Application found",
        })
      );
    });

    it("should return 500 on DB error", async () => {
      req.query = { id: "errorId" };
      req.uid = "mockUserUid";

      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      await applicationController.getOneApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "DB error",
        })
      );
    });
  });

  // ----------------------------------------------------------------
  // WITHDRAW APPLICATION (controller method: withdrawApplication)
  // ----------------------------------------------------------------
  describe("withdrawApplication", () => {
    it("should return 404 if app not found", async () => {
      req.query = { id: "someId" };
      req.uid = "mockUserUid";

      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Application.findById = jest.fn().mockResolvedValue(null);

      await applicationController.withdrawApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Application not found",
      });
    });

    it("should delete the application + return success", async () => {
      req.query = { id: "someId" };
      req.uid = "mockUserUid";

      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      const mockApp = { applicant: "someUserId", deleteOne: jest.fn() };
      Application.findById = jest.fn().mockResolvedValue(mockApp);

      await applicationController.withdrawApplication(req, res);

      expect(mockApp.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Application withdrawn",
        data: null,
      });
    });

    it("should return 403 if user is not the owner of the app", async () => {
      req.query = { id: "someId" };
      req.uid = "mockUserUid";

      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      const mockApp = { applicant: "someoneElseId", deleteOne: jest.fn() };
      Application.findById = jest.fn().mockResolvedValue(mockApp);

      await applicationController.withdrawApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized",
      });
    });

    it("should return 500 on error", async () => {
      req.query = { id: "errorId" };
      req.uid = "mockUserUid";

      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Application.findById = jest.fn().mockRejectedValue(new Error("DB error"));

      await applicationController.withdrawApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "DB error",
        })
      );
    });
  });
});
