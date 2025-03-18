import Job from '../../models/job.model.js';
import * as jobController from '../../controllers/job.controller.js';
import mongoose from 'mongoose';

jest.mock('../../models/job.model.js');

jest.mock('../../middlewares/auth.middleware.js', () => ({
  checkRole: () => (req, res, next) => {
    req.uid = "mock-firebase-uid"; 
    next();
  }
}));

describe('Job Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // --------------------------------------------------
  // CREATE JOB
  // --------------------------------------------------
  describe('createJob', () => {
    it('should create a job and return 201 status', async () => {
      req.postedBy = '12345';
      req.body = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        description: 'Develop awesome software',
        salaryRange: '100k-120k',
        employmentType: 'Full-time',
        requirements: ['JavaScript', 'Node.js'],
        experienceLevel: 'Mid-level',
      };

      const mockSave = jest.fn().mockResolvedValue({
        ...req.body,
        postedBy: req.postedBy,
        _id: "fakeJobId"
      });
      Job.prototype.save = mockSave;

      await jobController.createJob(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ...req.body,
        postedBy: req.postedBy,
        _id: "fakeJobId"
      });
    });

    it('should return 400 status if required fields are missing', async () => {
      // no description or postedBy in request
      req.body = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote'
        // no description
      };
      req.postedBy = undefined; 

      await jobController.createJob(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All required fields must be filled.' });
    });

    it('should return 500 on DB error', async () => {
      req.postedBy = '12345';
      req.body = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        description: 'some desc',
        employmentType: 'Full-time',
      };

      Job.prototype.save = jest.fn().mockRejectedValue(new Error("DB error"));

      await jobController.createJob(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "DB error"
      });
    });
  });

  // --------------------------------------------------
  // GET JOBS
  // --------------------------------------------------
  describe('getJobs', () => {
    it('should return all jobs with 200 status', async () => {
      const jobs = [
        { title: 'Software Engineer', company: 'Tech Corp' },
        { title: 'Data Scientist', company: 'Data Inc' }
      ];

      // jobController code => Job.find()
      Job.find.mockResolvedValue(jobs);

      await jobController.getJobs(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(jobs);
    });

    it('should return 500 on error', async () => {
      Job.find.mockRejectedValue(new Error("DB fail"));

      await jobController.getJobs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB fail" });
    });
  });

  // --------------------------------------------------
  // GET JOB BY ID
  // --------------------------------------------------
  describe('getJobById', () => {
    it('should return a job by id with 200 status', async () => {
      const job = { title: 'Software Engineer', company: 'Tech Corp' };
      req.params.id = '12345';

      Job.findById.mockResolvedValue(job);

      await jobController.getJobById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(job);
    });

    it('should return 404 status if job is not found', async () => {
      req.params.id = '12345';
      Job.findById.mockResolvedValue(null);

      await jobController.getJobById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('should return 500 on DB error', async () => {
      req.params.id = 'errorId';
      Job.findById.mockRejectedValue(new Error("DB error"));

      await jobController.getJobById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  // --------------------------------------------------
  // UPDATE JOB
  // --------------------------------------------------
  describe('updateJob', () => {
    it('should update a job and return 200 status', async () => {
      const updatedJob = { title: 'Updated Software Engineer', company: 'Tech Corp' };
      req.params.id = '12345';
      req.body = updatedJob;

      Job.findByIdAndUpdate.mockResolvedValue(updatedJob);

      await jobController.updateJob(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedJob);
    });

    it('should return 404 status if job is not found', async () => {
      req.params.id = '12345';
      req.body = { title: 'Updated Software Engineer' };
      Job.findByIdAndUpdate.mockResolvedValue(null);

      await jobController.updateJob(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('should return 500 on DB error', async () => {
      req.params.id = 'errorId';
      req.body = { title: 'anything' };
      Job.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

      await jobController.updateJob(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  // --------------------------------------------------
  // DELETE JOB
  // --------------------------------------------------
  describe('deleteJob', () => {
    it('should delete a job and return 200 status', async () => {
      const job = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        deleteOne: jest.fn().mockResolvedValue(true) // mocking instance method
      };
      req.params.id = '12345';

      Job.findById.mockResolvedValue(job);

      await jobController.deleteJob(req, res);

      expect(job.deleteOne).toHaveBeenCalled(); // confirm call job.deleteOne()
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job deleted successfully' });
    });

    it('should return 404 status if job is not found', async () => {
      req.params.id = '12345';
      Job.findById.mockResolvedValue(null);

      await jobController.deleteJob(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('should return 500 if db error', async () => {
      req.params.id = 'errorId';
      Job.findById.mockRejectedValue(new Error("DB error"));

      await jobController.deleteJob(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  // --------------------------------------------------
  // GET JOB COUNT BY TYPE
  // --------------------------------------------------
  describe("getJobCountByType", () => {
    it("should return the count of jobs by type", async () => {
      req.query.type = "Full-time";
      Job.countDocuments.mockResolvedValue(5);

      await jobController.getJobCountByType(req, res);

      expect(Job.countDocuments).toHaveBeenCalledWith({ employmentType: "Full-time" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ count: 5 });
    });

    it("should return 500 on db error", async () => {
      req.query.type = "Full-time";
      Job.countDocuments.mockRejectedValue(new Error("DB error"));

      await jobController.getJobCountByType(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  // --------------------------------------------------
  // GET ALL JOB ROLES
  // --------------------------------------------------
  describe("getAllJobRoles", () => {
    it("should return distinct titles array", async () => {
      const titles = ["Software Engineer", "Data Scientist"];
      Job.distinct.mockResolvedValue(titles);

      await jobController.getAllJobRoles(req, res);

      expect(Job.distinct).toHaveBeenCalledWith("title");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(titles);
    });

    it("should return 500 on db error", async () => {
      Job.distinct.mockRejectedValue(new Error("DB error"));

      await jobController.getAllJobRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to fetch job roles",
        error: "DB error"
      }));
    });
  });

  // --------------------------------------------------
  // GET ALL JOB LOCATIONS
  // --------------------------------------------------
  describe("getAllJobLocations", () => {
    it("should return distinct locations array", async () => {
      const locs = ["Remote", "San Francisco"];
      Job.distinct.mockResolvedValue(locs);

      await jobController.getAllJobLocations(req, res);

      expect(Job.distinct).toHaveBeenCalledWith("location");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(locs);
    });

    it("should return 500 on db error", async () => {
      Job.distinct.mockRejectedValue(new Error("DB error"));

      await jobController.getAllJobLocations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to fetch job locations",
        error: "DB error"
      }));
    });
  });

  // --------------------------------------------------
  // GET ALL JOB TYPES
  // --------------------------------------------------
  describe("getAllJobTypes", () => {
    it("should return distinct employmentType array", async () => {
      const types = ["Full-time", "Part-time"];
      Job.distinct.mockResolvedValue(types);

      await jobController.getAllJobTypes(req, res);

      expect(Job.distinct).toHaveBeenCalledWith("employmentType");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(types);
    });

    it("should return 500 on db error", async () => {
      Job.distinct.mockRejectedValue(new Error("DB error"));

      await jobController.getAllJobTypes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to fetch job types",
        error: "DB error"
      }));
    });
  });

  // --------------------------------------------------
  // GET FILTERED JOBS
  // --------------------------------------------------
  describe("getFilteredJobs", () => {
    it("should return jobs based on query filters", async () => {
      req.query = {
        jobType: "Full-time",
        location: "Remote",
        role: "Software Engineer"
      };

      const mockFilteredJobs = [
        { title: "Software Engineer", location: "Remote", employmentType: "Full-time" }
      ];
      Job.find.mockResolvedValue(mockFilteredJobs);

      await jobController.getFilteredJobs(req, res);

      expect(Job.find).toHaveBeenCalledWith({
        employmentType: "Full-time",
        location: "Remote",
        title: "Software Engineer"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFilteredJobs);
    });

    it("should handle multiple array filters if they exist", async () => {
      req.query = {
        jobType: ["Full-time", "Part-time"],
        location: ["Remote", "Onsite"],
        role: ["Data Scientist", "Backend Engineer"]
      };
      const mockJobs = [{ title: "Data Scientist", location: "Remote" }];

      Job.find.mockResolvedValue(mockJobs);

      await jobController.getFilteredJobs(req, res);

      expect(Job.find).toHaveBeenCalledWith({
        employmentType: { $in: ["Full-time", "Part-time"] },
        location: { $in: ["Remote", "Onsite"] },
        title: { $in: ["Data Scientist", "Backend Engineer"] }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockJobs);
    });

    it("should return 500 if an error occurs", async () => {
      Job.find.mockRejectedValue(new Error("DB error"));

      await jobController.getFilteredJobs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to fetch jobs",
        error: "DB error"
      }));
    });
  });
});
