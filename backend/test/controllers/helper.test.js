import mongoose from "mongoose";
import Job from "../../models/job.model.js";
import Application from "../../models/application.model.js";
import User from "../../models/user/user.model.js";
import { 
  handleError, 
  verifyJobOwnership, 
  formatAnswers, 
  isValidStatus, 
  getTotalStatus, 
  getJobsByEmployerHelper, 
  getLineGraphData
} from "../../controllers/helpers.js";

describe("Helper Functions", () => {
  describe("formatAnswers", () => {
    it("should format answers with ObjectId", () => {
      const input = [{
        questionId: "67e12749f741b803592a6256",
        answerText: "test answer"
      }];
      const result = formatAnswers(input);
      expect(result[0].questionId).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(result[0].answerText).toBe("test answer");
    });

    it("should handle empty array", () => {
      expect(formatAnswers([])).toEqual([]);
    });
  });

  describe("isValidStatus", () => {
    it("should return true for valid statuses", () => {
      expect(isValidStatus("Applying")).toBe(true);
      expect(isValidStatus("In Review")).toBe(true);
      expect(isValidStatus("Shortlisted")).toBe(true);
    });

    it("should return false for invalid statuses", () => {
      expect(isValidStatus("invalid")).toBe(false);
    });
  });

  describe("verifyJobOwnership", () => {
    it("should return true if user owns the job", async () => {
      const mockJob = { postedBy: "userId123" };
      Job.findById = jest.fn().mockResolvedValue(mockJob);
      const result = await verifyJobOwnership("jobId", "userId123");
      expect(result).toBe(true);
    });

    it("should return false if job not found", async () => {
      Job.findById = jest.fn().mockResolvedValue(null);
      const result = await verifyJobOwnership("jobId", "userId");
      expect(result).toBe(false);
    });
  });

  describe("handleError", () => {
    let res;
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("should handle errors with status code", () => {
      const error = new Error("Test error");
      error.status = 400;
      handleError(res, error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error"
      });
    });

    it("should use default message if error has none", () => {
      handleError(res, {}, "Default message");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Default message"
      });
    });
  });

  describe("getTotalStatus", () => {
    it("should return aggregated status counts for jobs", async () => {
      const mockJobs = [{ _id: "job1" }, { _id: "job2" }];
      const mockAggregation = [
        { _id: "Applied", count: 5 },
        { _id: "Rejected", count: 2 }
      ];

      Application.aggregate = jest.fn().mockResolvedValue(mockAggregation);

      const result = await getTotalStatus(mockJobs);
      expect(result).toEqual(mockAggregation);
      expect(Application.aggregate).toHaveBeenCalledWith([
        { $match: { job: { $in: ["job1", "job2"] } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);
    });

    it("should throw an error if aggregation fails", async () => {
      Application.aggregate = jest.fn().mockRejectedValue(new Error("Aggregation error"));
      await expect(getTotalStatus([{ _id: "job1" }])).rejects.toThrow("Aggregation error");
    });
  });

  describe("getJobsByEmployerHelper", () => {
    it("should return jobs for a valid employer", async () => {
      const mockEmployer = { _id: "employer1" };
      const mockJobs = [{ title: "Job 1" }, { title: "Job 2" }];

      User.findOne = jest.fn().mockResolvedValue(mockEmployer);
      Job.find = jest.fn().mockResolvedValue(mockJobs);

      const result = await getJobsByEmployerHelper("uid123");
      expect(result).toEqual(mockJobs);
      expect(User.findOne).toHaveBeenCalledWith({ uid: "uid123" });
      expect(Job.find).toHaveBeenCalledWith({ postedBy: "employer1" });
    });

    it("should throw an error if employer is not found", async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      await expect(getJobsByEmployerHelper("uid123")).rejects.toThrow("Employer not found");
    });

    it("should throw an error if fetching jobs fails", async () => {
      User.findOne = jest.fn().mockResolvedValue({ _id: "employer1" });
      Job.find = jest.fn().mockRejectedValue(new Error("Database error"));

      await expect(getJobsByEmployerHelper("uid123")).rejects.toThrow("Database error");
    });
  });

  describe("getLineGraphData", () => {
    it("should return line graph data for job applications", async () => {
      const mockJobIds = ["job1", "job2"];
      const mockLineGraphData = [
        { jobId: "job1", date: "01-01-2023", count: 5 },
        { jobId: "job2", date: "02-01-2023", count: 3 }
      ];

      Application.aggregate = jest.fn().mockResolvedValue(mockLineGraphData);

      const result = await getLineGraphData(mockJobIds);
      expect(result).toEqual(mockLineGraphData);
      expect(Application.aggregate).toHaveBeenCalledWith([
        { $match: { job: { $in: mockJobIds }, status: { $ne: "Applying" } } },
        { $group: { _id: { jobId: "$job", date: { $dateToString: { format: "%d-%m-%Y", date: "$submittedAt" } } }, count: { $sum: 1 } } },
        { $sort: { "_id.date": 1 } },
        { $project: { jobId: "$_id.jobId", date: "$_id.date", count: 1, _id: 0 } }
      ]);
    });

    it("should throw an error if aggregation fails", async () => {
      Application.aggregate = jest.fn().mockRejectedValue(new Error("Aggregation error"));
      await expect(getLineGraphData(["job1"])).rejects.toThrow("Failed to fetch line graph data");
    });
  });
});
