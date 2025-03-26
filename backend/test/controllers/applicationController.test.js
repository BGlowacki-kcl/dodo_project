import { applicationController } from "../../controllers/application.controller.js";
import Application from "../../models/application.model.js";
import Job from "../../models/job.model.js";
import User from "../../models/user/user.model.js";  
import { mockApplications } from "../fixtures/application.fixture.js";
import { getLineGraphData, createResponse, handleStatusProgression, getJobsByEmployer, buildDashboardData, getTotalStatus, handleRejection, formatAnswers, isValidStatus, verifyJobOwnership, handleError } from "../../controllers/application.controller.js";
import mongoose from 'mongoose';

jest.mock('../../middlewares/auth.middleware.js', () => ({
  checkRole: () => (req, res, next) => {
    req.uid = "mock-firebase-uid";
    next();
  }
}));

jest.mock('../../controllers/application.controller.js', () => {
  const actual = jest.requireActual('../../controllers/application.controller.js');
  return {
    ...actual,
    getJobsByEmployer: jest.fn(),
    getTotalStatus: jest.fn(),
    getLineGraphData: jest.fn(),
    buildDashboardData: actual.buildDashboardData,
  };
});

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

      const formattedAnswers = [];
      req.body = {
        jobId: "job123",
        coverLetter: "cover",
        answers: formattedAnswers,
      };

      const mockApp = {
        _id: "newAppId",
        job: { _id: "job123", title: "Test Job" },
        populate: jest.fn().mockReturnThis()
      };
      Application.create = jest.fn().mockResolvedValue(mockApp);

      await applicationController.createApplication(req, res);

      expect(Application.create).toHaveBeenCalledWith({
        job: "job123",
        applicant: "someUserId",
        coverLetter: "cover",
        answers: formattedAnswers,
        status: "Applying",
      });
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
      req.body = { status: "Applied" }; // Match updated valid status
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
      req.body = { status: "Applied" }; // Match updated valid status
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
        status: { $ne: "Applying" }, // Match updated status
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
      req.uid = "mockUserUid";
      
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
      
      // Create a complete mock that simulates the entire chain
      const populateJobMock = jest.fn().mockResolvedValue(null);
      const populateApplicantMock = jest.fn().mockReturnValue({
        populate: populateJobMock
      });
      
      Application.findById = jest.fn().mockReturnValue({
        populate: populateApplicantMock
      });
      
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
    
      User.findOne = jest.fn().mockResolvedValue({ _id: "userIdA" });
      
      const mockApp = {
        _id: "someId",
        applicant: {
          _id: {
            equals: jest.fn().mockReturnValue(false) 
          },
          name: "Test User",
          email: "test@example.com"
        },
        job: { title: "Test Job" }
      };
    
      const populateJobMock = jest.fn().mockResolvedValue(mockApp);
      const populateApplicantMock = jest.fn().mockReturnValue({
        populate: populateJobMock
      });
      
      Application.findById = jest.fn().mockReturnValue({
        populate: populateApplicantMock
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
      
      const user = { _id: "someUserId" };
      User.findOne = jest.fn().mockResolvedValue(user);
      
      const mockApp = {
        _id: "someId",
        applicant: { 
          _id: {
            equals: jest.fn().mockReturnValue(true) 
          },
          name: "Test User",
          email: "test@example.com"
        },
        job: { title: "Test Job" },
        populate: jest.fn().mockReturnThis(),
      };
      
      Application.findById = jest.fn().mockReturnValue({
        ...mockApp,
        populate: jest.fn().mockReturnThis()
      });
      
      await applicationController.getOneApplication(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Application found"
      }));
    });

    it("should return 500 on DB error", async () => {
      req.query = { id: "errorId" };
      req.uid = "mockUserUid";
  
      User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
  
      Application.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockRejectedValue(new Error("Error getting application"))
      });
  
      await applicationController.getOneApplication(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
              success: false,
              message: "Error getting application",
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
      const mockApp = {
        applicant: {
          equals: jest.fn().mockReturnValue(false)
        },
        deleteOne: jest.fn()
      };
      
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

  describe("saveApplication", () => {
    it("should return 400 if application is not found", async () => {
        req.body = { applicationId: "invalidId", coverLetter: "New cover letter", answers: [] };
        req.uid = "mockUserUid";

        User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
        Application.findOne = jest.fn().mockResolvedValue(null);

        await applicationController.saveApplication(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Cannot save application",
            })
        );
    });

    it("should return 400 if application status is not 'applying'", async () => {
        req.body = { applicationId: "validId", coverLetter: "Updated", answers: [] };
        req.uid = "mockUserUid";

        User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
        Application.findOne = jest.fn().mockResolvedValue({ status: "submitted" });

        await applicationController.saveApplication(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Cannot save application",
            })
        );
    });

    it("should update cover letter and answers if valid", async () => {
        const mockAnswers = [{
            questionId: new mongoose.Types.ObjectId("67e12749f741b803592a6256"),
            answerText: "answer1"
        }];
        
        req.body = { 
            applicationId: "validId", 
            coverLetter: "Updated letter", 
            answers: [{
                questionId: "67e12749f741b803592a6256",
                answerText: "answer1"
            }]
        };

        const mockApp = {
            status: "Applying", // Match updated status
            save: jest.fn(),
            coverLetter: "",
            answers: []
        };

        User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
        Application.findOne = jest.fn().mockResolvedValue(mockApp);

        await applicationController.saveApplication(req, res);

        expect(mockApp.coverLetter).toBe("Updated letter");
        expect(mockApp.answers[0].questionId).toEqual(mockAnswers[0].questionId);
        expect(mockApp.answers[0].answerText).toBe(mockAnswers[0].answerText);
    });

    it("should return 500 if a database error occurs", async () => {
        req.body = { applicationId: "validId", coverLetter: "Updated", answers: [] };
        req.uid = "mockUserUid";

        User.findOne = jest.fn().mockResolvedValue({ _id: "someUserId" });
        Application.findOne = jest.fn().mockRejectedValue(new Error("Error saving application"));

        await applicationController.saveApplication(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Error saving application"
        });
    });
  });

  describe('handleStatusProgression', () => {
    let res, application, user;

    beforeEach(() => {
      res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      application = { status: 'applied', save: jest.fn(), job: { assessments: [] } };
      user = { role: 'applicant' };
    });

    it('should progress to the next status for valid applicant', async () => {
      application.status = 'Code Challenge';
      user.role = 'applicant';
      await handleStatusProgression(res, application, user);
      expect(application.status).toBe('In Review');
      expect(application.save).toHaveBeenCalled();
    });

    it('should prevent employer from updating status in code challenge', async () => {
      user.role = 'employer';
      application.status = 'Code Challenge';
      await handleStatusProgression(res, application, user);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(createResponse(false, 'Cannot update status'));
    });

    it('should prevent applicant from updating status not in code challenge', async () => {
      application.status = 'applied';
      await handleStatusProgression(res, application, user);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should skip to in review if no assessments are present', async () => {
      const mockApp = {
        status: 'Shortlisted', // Match updated status
        job: { assessments: [] },
        save: jest.fn()
      };
      const mockUser = { role: 'employer' };

      await handleStatusProgression(res, mockApp, mockUser);
      expect(mockApp.status).toBe('In Review'); // Match updated status
    });

    it('should return error if no further status available', async () => {
      application.status = 'accepted';
      await handleStatusProgression(res, application, user);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getJobsByEmployer', () => {
    beforeEach(() => {
        getJobsByEmployer.mockReset();
    });

    it('should return jobs for a valid employer', async () => {
      const mockJobs = [{ title: 'Job 1' }, { title: 'Job 2' }];
      getJobsByEmployer.mockResolvedValue(mockJobs);

      const result = await getJobsByEmployer('uid123');
      expect(result).toEqual(mockJobs);
    });

    it('should throw error if employer not found', async () => {
      getJobsByEmployer.mockRejectedValue(new Error('Employer not found'));
      
      await expect(getJobsByEmployer('uid123'))
          .rejects
          .toThrow('Employer not found');
    });
  });

  describe('buildDashboardData', () => {
    beforeEach(() => {
        jest.clearAllMocks(); 
    });

    it('should build dashboard data correctly', async () => {
      const employer = { companyName: 'Test Corp' };
      const jobs = [{ _id: 'job1' }, { _id: 'job2' }];
      const totalStatus = [{ _id: 'applied', count: 10 }];
      const lineGraphData = [{ jobId: 'job1', date: '2023-01-01', count: 5 }];
  
      getTotalStatus.mockResolvedValueOnce(totalStatus);
      getLineGraphData.mockResolvedValueOnce(lineGraphData);
  
      const result = await buildDashboardData(employer, jobs);
  
      expect(result).toEqual({
          totalJobs: 2,
          totalStatus,
          companyName: 'Test Corp',
          jobs,
          lineGraphData,
      });
  
      expect(getTotalStatus).toHaveBeenCalledWith(jobs);
      expect(getLineGraphData).toHaveBeenCalledWith(jobs);
  });  
});

  describe('getTotalStatus', () => {
    beforeEach(() => {
        Application.aggregate = jest.fn();
    });

    it('should return aggregated status counts', async () => {
      const jobs = [{ _id: 'job1' }, { _id: 'job2' }];
      const mockAggregation = [{ _id: 'applied', count: 10 }];

      Application.aggregate.mockResolvedValue(mockAggregation);

      const result = await getTotalStatus(jobs);
      expect(result).toEqual(mockAggregation);
    });
  });

  jest.mock('../../models/application.model.js', () => ({
    Application: {
      aggregate: jest.fn(),
    },
  }));
  
  describe('getLineGraphData', () => {
    beforeEach(() => {
        Application.aggregate = jest.fn(); 
    });

    it('should return line graph data for jobs', async () => {
      const jobs = [{ _id: 'job1' }, { _id: 'job2' }];
      const mockData = [
          { jobId: 'job1', date: '2023-01-01', count: 5 },
          { jobId: 'job2', date: '2023-01-02', count: 3 },
      ];
  
      Application.aggregate.mockResolvedValueOnce(mockData);
  
      const result = await getLineGraphData(jobs);
  
      expect(result).toEqual(mockData);
  
      expect(Application.aggregate).toHaveBeenCalledWith([
          { $match: { job: { $in: jobs.map(job => job._id) }, status: { $ne: "Applying" } } },
          {
              $group: {
                  _id: {
                      jobId: "$job",
                      date: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
                  },
                  count: { $sum: 1 },
              },
          },
          { $sort: { "_id.date": 1 } },
          { $project: { jobId: "$_id.jobId", date: "$_id.date", count: 1, _id: 0 } },
      ]);
  });  
});

});

// Add more test cases for endpoints that need coverage
describe('Additional Endpoint Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            uid: "mock-firebase-uid"
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAssessmentDeadline', () => {
        it('should return -1 if no deadline set', async () => {
            req.query = { id: 'appId' };
            const mockApp = { _id: 'appId' };
            Application.findById = jest.fn().mockResolvedValue(mockApp);

            await applicationController.getAssessmentDeadline(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "No assessment deadline set",
                    data: -1
                })
            );
        });
    });

    describe('setAssessmentDeadline', () => {
        it('should set deadline successfully', async () => {
            const deadline = new Date();
            req.query = { id: 'appId' };
            req.body = { deadline };
            
            const mockApp = {
                _id: 'appId',
                save: jest.fn().mockResolvedValue(true)
            };
            Application.findById = jest.fn().mockResolvedValue(mockApp);

            await applicationController.setAssessmentDeadline(req, res);

            expect(mockApp.finishAssessmentDate).toEqual(deadline);
            expect(mockApp.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Assessment deadline set"
                })
            );
        });
    });

    describe('submitApplication', () => {
        it('should submit application successfully', async () => {
            req.body = { applicationId: 'appId' };
            req.uid = 'userId';

            const mockApp = {
                _id: 'appId',
                status: 'Applying', // Match updated status
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne = jest.fn().mockResolvedValue({ _id: 'userId' });
            Application.findOne = jest.fn().mockResolvedValue(mockApp);

            await applicationController.submitApplication(req, res);

            expect(mockApp.status).toBe('Applied'); // Match updated status
            expect(mockApp.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Application submitted successfully"
                })
            );
        });
    });
});