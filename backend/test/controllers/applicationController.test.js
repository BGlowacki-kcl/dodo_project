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




  /// cancel tests
  describe("cancel", () => {
    it("should return 404 if application not found", async () => {
      req.params = { applicationId: "fakeId" };
      Application.findById = jest.fn().mockResolvedValue(null);

      await applicationController.cancel(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Application not found",
      });
    });

    it("should return 400 if status !== 'applying'", async () => {
      req.params = { applicationId: "someId" };
      const mockApp = { status: "applied" };
      Application.findById = jest.fn().mockResolvedValue(mockApp);

      await applicationController.cancel(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Only applications in 'applying' status can be canceled",
      });
    });

    it("should delete and return 200 if status = 'applying'", async () => {
      req.params = { applicationId: "someId" };
      const mockApp = { status: "applying" };
      Application.findById = jest.fn().mockResolvedValue(mockApp);
      Application.findByIdAndDelete = jest.fn().mockResolvedValue(true);

      await applicationController.cancel(req, res);

      expect(Application.findByIdAndDelete).toHaveBeenCalledWith("someId");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Application canceled successfully",
      });
    });

    it("should return 500 on DB error", async () => {
      req.params = { applicationId: "someId" };
      Application.findById = jest.fn().mockRejectedValue(new Error("DB error"));

      await applicationController.cancel(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          //message: "Error canceling application",
          message: "DB error",
        })
      );
    });
  });

  //updating status tests
  describe("updateApplicationStatus", () => {
    it("should return 400 if status is invalid", async () => {
      req.params = { id: "appId" };
      req.body = { status: "unknown" };

      await applicationController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid application status",
      });
    });

    it("should return 404 if application not found", async () => {
      req.params = { id: "someId" };
      req.body = { status: "applied" };
      Application.findById = jest.fn().mockResolvedValue(null);

      await applicationController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Application not found",
      });
    });

    it("should update status + return 200 if found", async () => {
      req.params = { id: "someId" };
      req.body = { status: "applied" };
      const mockApp = { _id: "someId", save: jest.fn() };
      Application.findById = jest.fn().mockResolvedValue(mockApp);

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

    it("should return 500 on error", async () => {
      req.params = { id: "errorId" };
      req.body = { status: "applied" };
      Application.findById = jest.fn().mockRejectedValue(new Error("DB error"));

      await applicationController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          // message: "Error updating application status",
          message: "DB error",
        })
      );
    });
  });

  //// get applicant tests
  describe("getApplicants", () => {
    it("should return a list of applicants (200)", async () => {
      req.params = { jobId: "someJobId" };
      const mockApp = {
        applicant: { _id: "userId", name: "TestUser", email: "test@user.com" },
      };
      Application.find = jest
        .fn()
        .mockReturnValue({ populate: jest.fn().mockResolvedValue([mockApp]) });

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

    it("should return 500 on error", async () => {
      req.params = { jobId: "errJob" };
      Application.find = jest
        .fn()
        .mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error("DB error")) });

      await applicationController.getApplicants(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          // message: "Error retrieving applicants",
          message: "DB error",
        })
      );
    });
  });

 /// get all applications tests
  describe("getAllApplications", () => {
    it("should fetch all apps if no applicant param", async () => {
      Application.find = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockApplications) });
      req.query = {};

      await applicationController.getAllApplications(req, res);

      expect(Application.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Applications fetched",
        })
      );
    });

    it("should filter by applicant if query param is present", async () => {
      req.query = { applicant: "abc123" };
      Application.find = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockApplications) });

      await applicationController.getAllApplications(req, res);

      expect(Application.find).toHaveBeenCalledWith({ applicant: "abc123" });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Applications fetched",
        })
      );
    });

    it("should return 500 on DB error", async () => {
      Application.find = jest.fn().mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error("DB error")) });
      
      req.query = {};
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

  /// GET ONE APPLICATION TESTS
  describe("getOneApplication", () => {
    it("should return 404 if not found", async () => {
      req.params = { id: "someId" };
      Application.findById = jest
        .fn()
        .mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await applicationController.getOneApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Application not found",
        })
      );
    });

    it("should return 200 + app doc if found", async () => {
      req.params = { id: "someId" };
      Application.findById = jest
        .fn()
        .mockReturnValue({ populate: jest.fn().mockResolvedValue(mockApplications[0]) });

      await applicationController.getOneApplication(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Application found",
        })
      );
    });

    it("should return 500 on DB error", async () => {
      req.params = { id: "errorId" };
      Application.findById = jest
        .fn()
        .mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error("DB error")) });

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

  // CREATE APPLICATION TESTS
  describe("createApplication", () => {
    it("should return 400 if missing jobId or applicant", async () => {
      req.body = { jobId: null, applicant: null };
      await applicationController.createApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Missing jobId or applicant in body",
        })
      );
    });

    it("should create a new application (201) if valid", async () => {
      req.body = {
        jobId: "job123",
        applicant: "user123",
        coverLetter: "cover",
      };
      const mockSaveApp = {
        populate: jest.fn().mockResolvedValue({ _id: "newAppId" }),
      };
      Application.create = jest.fn().mockResolvedValue(mockSaveApp);

      await applicationController.createApplication(req, res);

      expect(Application.create).toHaveBeenCalledWith({
        job: "job123",
        applicant: "user123",
        coverLetter: "cover",
        status: "applied",
      });
      expect(mockSaveApp.populate).toHaveBeenCalledWith("job");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Application created",
        })
      );
    });

    it("should return 500 if DB error", async () => {
      req.body = { jobId: "job456", applicant: "user456" };
      Application.create = jest.fn().mockRejectedValue(new Error("DB error"));

      await applicationController.createApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "DB error",
        })
      );
    });
  });

  //Withdraw application Tests
  describe("withdrawApplication", () => {
    it("should return 404 if app not found", async () => {
      req.params = { id: "someId" };
      Application.findById = jest.fn().mockResolvedValue(null);

      await applicationController.withdrawApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Application not found",
      });
    });

    it("should delete the application + return success", async () => {
      req.params = { id: "someId" };
      const mockApp = { _id: "someId", deleteOne: jest.fn() };
      Application.findById = jest.fn().mockResolvedValue(mockApp);

      await applicationController.withdrawApplication(req, res);

      expect(mockApp.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Application withdrawn",
        data: null,
      });
    });

    it("should return 500 on error", async () => {
      req.params = { id: "errorId" };
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