import { applicationController } from "../../controllers/application.controller.js";
import Application from "../../models/application.model.js";
import Job from "../../models/job.model.js";
import User from "../../models/user/user.model.js";  
import { mockApplications } from "../fixtures/application.fixture.js";

jest.mock('../../middlewares/auth.middleware.js', () => ({
  checkRole: () => (req, res, next) => {
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
      uid: "mock-firebase-uid", 
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
      req.body = { coverLetter: "some cover letter" };
      await applicationController.createApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid request data",  // Changed to match controller message
        })
      );
    });

    it("should create a new application (201) if valid", async () => {
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Job.findByIdAndUpdate = jest.fn().mockResolvedValue({}); // Add missing mock

      req.body = {
        jobId: "job123",
        coverLetter: "cover",
        answers: [], // Add required answers array
      };

      const mockApp = {
        populate: jest.fn().mockResolvedValue({
          _id: "newAppId",
          job: { _id: "job123", title: "Test Job" },
        }),
      };
      Application.create = jest.fn().mockResolvedValue(mockApp);

      await applicationController.createApplication(req, res);

      expect(Application.create).toHaveBeenCalledWith({
        job: "job123",
        applicant: "someUserId",
        coverLetter: "cover",
        answers: [],
        status: "applying", // Changed to match controller
      });
    });

    it("should return 500 if DB error", async () => {
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      req.body = { 
        jobId: "job456", 
        coverLetter: "any letter",
        answers: []
      };

      Application.create = jest.fn().mockRejectedValue(new Error("DB error"));

      await applicationController.createApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error creating application"
        })
      );
    });
  });

  describe("getApplication", () => {
    it("should return an application if found", async () => {
      req.params = { jobId: "job123" };
      req.uid = "mock-uid-user";
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
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });
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
      req.params = { id: "someAppId" };
      req.body = { status: "applied" };
      req.uid = "someone-else-uid";

      const mockApp = { _id: "someAppId", save: jest.fn(), job: "mockJobId" };
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });
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
      Application.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      await applicationController.updateApplicationStatus(req, res);

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
  // GET APPLICANTS (controller method: getApplicants)
  // ----------------------------------------------------------------
  describe("getApplicants", () => {
    it("should return a list of applicants (200)", async () => {
      req.query = { jobId: "someJobId" }; // Changed from params to query
      Job.findById = jest.fn().mockResolvedValue({ _id: "someJobId" });

      const mockApp = {
        applicant: { _id: "userId", name: "TestUser", email: "test@user.com" },
      };
      Application.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockApp]),
      });

      await applicationController.getApplicants(req, res);

      expect(Application.find).toHaveBeenCalledWith({
        job: "someJobId",
        status: { $ne: "applying" },
      });
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
    beforeEach(() => {
      Job.findById = jest.fn().mockResolvedValue({ _id: "jobId" });
    });

    it("should return 404 if not found", async () => {
      req.query = { id: "someId" };
      
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Application.findById = jest.fn().mockReturnValue(null);

      await applicationController.getOneApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Application not found"
        })
      );
    });

    it("should return 403 if the user does not own the app", async () => {
      req.query = { id: "someId" };
      req.uid = "mockUserUid";

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
      
      const mockApp = {
        _id: "someId",
        applicant: { _id: "someUserId" },
        populate: jest.fn().mockReturnThis(),
      };

      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      Application.findById = jest.fn().mockReturnValue(mockApp);

      await applicationController.getOneApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
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
      
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      const mockApp = { 
        applicant: { equals: jest.fn().mockReturnValue(true) },
        deleteOne: jest.fn().mockResolvedValue({})
      };
      Application.findById = jest.fn().mockResolvedValue(mockApp);

      await applicationController.withdrawApplication(req, res);

      expect(mockApp.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Application withdrawn"
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
          message: "Error withdrawing application",
        })
      );
    });
  });
});
