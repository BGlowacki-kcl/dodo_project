import mongoose from "mongoose";
import Job from "../../models/job.model.js";
import { handleError, handleRejection, verifyJobOwnership, formatAnswers, isValidStatus } from "../../controllers/helpers.js";

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

  describe("handleRejection", () => {
    let res;
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("should prevent rejecting accepted applications", async () => {
      const application = { status: "accepted" };
      await handleRejection(res, application);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Cannot reject an accepted application"
      });
    });

    it("should reject application successfully", async () => {
      const application = {
        status: "applied",
        save: jest.fn().mockResolvedValue(true)
      };
      await handleRejection(res, application);
      expect(application.status).toBe("rejected");
      expect(application.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Application rejected",
        data: application
      });
    });
  });
});
