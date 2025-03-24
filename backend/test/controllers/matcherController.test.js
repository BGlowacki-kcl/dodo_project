// matcherController.test.js

import { query, getUserJobRecommendations, validateUser, fetchJobs, computeJobMatches, sortJobMatches } from "../../controllers/matcher.controller.js";
import { JobSeeker } from "../../models/user/jobSeeker.model.js";
import Job from "../../models/job.model.js";

global.fetch = jest.fn();

// Mock Job.find properly
jest.mock('../../models/job.model.js', () => ({
    find: jest.fn().mockReturnValue({ limit: jest.fn() }),
    findOne: jest.fn()
}));

jest.mock('../../models/user/jobSeeker.model.js');

describe("matcher.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("query function", () => {
    const mockCvText = "My CV text";
    const mockJobDescription = "Job requires JavaScript and Node.js experience.";
    const mockApiUrl = /https:\/\/api-inference\.huggingface\.co\/models\//;

    it("should throw an error if fetch response is not ok", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      await expect(query(mockCvText, mockJobDescription)).rejects.toThrow(
        "API request failed with status: 500"
      );
      expect(fetch).toHaveBeenCalledWith(expect.stringMatching(mockApiUrl), expect.any(Object));
    });

    it("should throw error if the result array is empty or not an array", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });
      await expect(query(mockCvText, mockJobDescription)).rejects.toThrow("Invalid API response");
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ foo: "bar" }),
      });
      await expect(query(mockCvText, mockJobDescription)).rejects.toThrow("Invalid API response");
    });

    it("should return jobDescription and similarityScore if fetch is successful", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([0.89]),
      });

      const result = await query(mockCvText, mockJobDescription);

      expect(fetch).toHaveBeenCalledWith(expect.stringMatching(mockApiUrl), expect.any(Object));
      expect(result).toEqual({
        jobDescription: mockJobDescription,
        similarityScore: 0.89,
      });
    });
  });

  describe("getUserJobRecommendations", () => {
    let req, res;

    beforeEach(() => {
      req = {
        query: { excludeJobIds: [] },
        uid: undefined
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });

    it("should return 400 if uid is missing", async () => {
      await getUserJobRecommendations(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User ID is required" });
    });

    it("should return 404 if user is not found", async () => {
      req.uid = "some-uid";
      JobSeeker.findOne = jest.fn().mockResolvedValue(null);

      await getUserJobRecommendations(req, res);
      expect(JobSeeker.findOne).toHaveBeenCalledWith({ uid: "some-uid" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 400 if user resume is missing", async () => {
      req.uid = "some-uid";
      JobSeeker.findOne = jest.fn().mockResolvedValue({ resume: null });

      await getUserJobRecommendations(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User CV is missing" });
    });

    it("should handle API request failure", async () => {
      req.uid = "some-uid";
      req.query.excludeJobIds = [];
      
      const mockUser = { resume: "My CV" };
      const mockJobs = [{ 
        description: "Job description",
        toObject: () => ({ _id: "job1", description: "Job description" })
      }];

      JobSeeker.findOne.mockResolvedValue(mockUser);
      const mockLimit = jest.fn().mockResolvedValue(mockJobs);
      Job.find.mockReturnValue({ limit: mockLimit });

      fetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      await getUserJobRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "API request failed with status: 500" 
      });
    });

    it("should return successful recommendations", async () => {
      req.uid = "some-uid";
      req.query.excludeJobIds = [];
      
      const mockUser = { resume: "My CV" };
      const mockJobs = [{ 
        description: "Job description",
        toObject: () => ({ _id: "job1", description: "Job description" })
      }];

      JobSeeker.findOne.mockResolvedValue(mockUser);
      const mockLimit = jest.fn().mockResolvedValue(mockJobs);
      Job.find.mockReturnValue({ limit: mockLimit });

      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([0.85])
      });

      await getUserJobRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        recommendedJobs: expect.arrayContaining([
          expect.objectContaining({
            similarityScore: 0.85
          })
        ])
      });
    });

    // Add tests for untested lines (76-78, 104-107)
    it('should handle empty job results', async () => {
      req.uid = "some-uid";
      req.query.excludeJobIds = [];
      
      const mockUser = { resume: "My CV" };
      JobSeeker.findOne.mockResolvedValue(mockUser);
      const mockLimit = jest.fn().mockResolvedValue([]);
      Job.find.mockReturnValue({ limit: mockLimit });

      await getUserJobRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        recommendedJobs: []
      });
    });

    it('should handle excludeJobIds filter', async () => {
      req.uid = "some-uid";
      req.query.excludeJobIds = ["job1", "job2"];
      
      const mockUser = { resume: "My CV" };
      JobSeeker.findOne.mockResolvedValue(mockUser);
      const mockLimit = jest.fn().mockResolvedValue([]);
      Job.find.mockReturnValue({ limit: mockLimit });

      await getUserJobRecommendations(req, res);

      expect(Job.find).toHaveBeenCalledWith({
        _id: { $nin: ["job1", "job2"] }
      });
    });
  });

  // Add tests for validateUser function
  describe('validateUser', () => {
    it('should throw error if uid is missing', () => {
        expect(() => validateUser(null, {}))
            .toThrow('User ID is required');
    });

    it('should throw error if user is not found', () => {
        expect(() => validateUser('uid', null))
            .toThrow('User not found');
    });

    it('should throw error if resume is missing', () => {
        expect(() => validateUser('uid', { resume: null }))
            .toThrow('User CV is missing');
    });

    it('should not throw error if all validations pass', () => {
        expect(() => validateUser('uid', { resume: 'cv' }))
            .not.toThrow();
    });
  });

  // Add tests for helper functions
  describe('fetchJobs', () => {
    it('should call find with correct exclude filter', async () => {
        const excludeJobIds = ['job1', 'job2'];
        const mockLimit = jest.fn().mockResolvedValue([]);
        Job.find.mockReturnValue({ limit: mockLimit });

        await fetchJobs(excludeJobIds);

        expect(Job.find).toHaveBeenCalledWith({
            _id: { $nin: excludeJobIds }
        });
        expect(mockLimit).toHaveBeenCalledWith(30);
    });
  });

  describe('computeJobMatches', () => {
    it('should compute similarity scores for jobs', async () => {
        const mockJobs = [{
            description: 'job desc',
            toObject: () => ({ _id: 'job1', description: 'job desc' })
        }];

        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue([0.85])
        });

        const result = await computeJobMatches(mockJobs, 'resume');
        expect(result[0].similarityScore).toBe(0.85);
    });
  });

  describe('sortJobMatches', () => {
    it('should sort jobs by similarity score in descending order', () => {
        const matches = [
            { similarityScore: 0.5 },
            { similarityScore: 0.9 },
            { similarityScore: 0.7 }
        ];

        const sorted = sortJobMatches(matches);
        expect(sorted[0].similarityScore).toBe(0.9);
        expect(sorted[1].similarityScore).toBe(0.7);
        expect(sorted[2].similarityScore).toBe(0.5);
    });
  });
});
