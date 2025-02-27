import { query, getUserJobRecommendations } from "../../controllers/matcher.controller.js";
import { JobSeeker } from "../../models/user/jobSeeker.model.js";
import Job from "../../models/job.model.js";

global.fetch = jest.fn();

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
      await expect(query(mockCvText, mockJobDescription)).rejects.toThrow("Error response");
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ foo: "bar" }),
      });

      await expect(query(mockCvText, mockJobDescription)).rejects.toThrow("Error response");
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
        query: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });
    it("should return 400 if uid is missing", async () => {
      req.query = {}; 
      await getUserJobRecommendations(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User ID is required" });
    });

    it("should return 404 if user is not found", async () => {
      req.query = { uid: "some-uid" };
      JobSeeker.findOne = jest.fn().mockResolvedValue(null);

      await getUserJobRecommendations(req, res);
      expect(JobSeeker.findOne).toHaveBeenCalledWith({ uid: "some-uid" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 400 if user resume is missing", async () => {
      req.query = { uid: "some-uid" };
      JobSeeker.findOne = jest.fn().mockResolvedValue({ resume: null });
      await getUserJobRecommendations(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User CV is missing" });
    });

    // it("should call query() for each job, sort by similarityScore desc, and return top 5", async () => {             // Some issue with this test
    //   req.query = { uid: "some-uid" };
    //   const fakeUser = { resume: "Fake CV text" };
    //   JobSeeker.findOne = jest.fn().mockResolvedValue(fakeUser);
    //   const fakeJobs = [{ _id: "job1", description: "Job desc 1", toObject: jest.fn().mockReturnValue({ _id: "job1" }) },
    //     { _id: "job2", description: "Job desc 2", toObject: jest.fn().mockReturnValue({ _id: "job2" }) },
    //     { _id: "job3", description: "Job desc 3", toObject: jest.fn().mockReturnValue({ _id: "job3" }) },
    //   ];
    //   Job.find = jest.fn().mockResolvedValue(fakeJobs);
    //   let fetchCallCount = 0;
    //   fetch.mockImplementation(() => {
    //     fetchCallCount++;
    //     const scores = [0.8, 0.7, 0.95];
    //     return Promise.resolve({
    //       ok: true,
    //       json: () => Promise.resolve([scores[fetchCallCount - 1]]),
    //     });
    //   });

    //   await getUserJobRecommendations(req, res);

    //   expect(JobSeeker.findOne).toHaveBeenCalledWith({ uid: "some-uid" });
    //   expect(Job.find).toHaveBeenCalled();

    //   expect(res.status).toHaveBeenCalledWith(200);
    //   const { recommendedJobs } = res.json.mock.calls[0][0];

    //   expect(recommendedJobs[0]._id).toBe("job3");
    //   expect(recommendedJobs[1]._id).toBe("job1");
    //   expect(recommendedJobs[2]._id).toBe("job2");
    //   expect(recommendedJobs).toHaveLength(3); 
    //   expect(fetch).toHaveBeenCalledTimes(3);
    // });

    it("should throw an error if query() fails for a job and cause the request to fail", async () => {
      req.query = { uid: "some-uid" };
      JobSeeker.findOne = jest.fn().mockResolvedValue({ resume: "my CV" });
      Job.find = jest.fn().mockResolvedValue([{ description: "one job", toObject: () => ({}) }]);

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      await expect(getUserJobRecommendations(req, res)).rejects.toThrow(
        "API request failed with status: 500"
      );
    });
  });
});
