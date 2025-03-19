import { getShortlist, addJobToShortlist, removeJobFromShortlist } from "../../controllers/shortlist.controller.js";
import Shortlist from "../../models/shortlist.model.js";
import Job from "../../models/job.model.js";

jest.mock("../../models/shortlist.model.js");
jest.mock("../../models/job.model.js");

describe("Shortlist Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      uid: "mockUserId",
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ----------------------------------------------------
  // getShortlist
  // ----------------------------------------------------
  describe("getShortlist", () => {
    it("should return 404 if shortlist not found", async () => {
      Shortlist.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getShortlist(req, res);

      expect(Shortlist.findOne).toHaveBeenCalledWith({ user: "mockUserId" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Shortlist not found" });
    });

    it("should return the shortlist if found", async () => {
      const mockShortlist = {
        _id: "shortlistId",
        jobs: [],
      };
      Shortlist.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockShortlist),
      });

      await getShortlist(req, res);

      expect(Shortlist.findOne).toHaveBeenCalledWith({ user: "mockUserId" });
      expect(res.json).toHaveBeenCalledWith(mockShortlist);
    });

    it("should return 500 on error", async () => {
      Shortlist.findOne.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      await getShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  // ----------------------------------------------------
  // addJobToShortlist
  // ----------------------------------------------------
  describe("addJobToShortlist", () => {
    beforeEach(() => {
      req.params.jobId = "someJobId";
    });

    it("should return 404 if job not found", async () => {
      Job.findById.mockResolvedValue(null);

      await addJobToShortlist(req, res);

      expect(Job.findById).toHaveBeenCalledWith("someJobId");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Job not found" });
    });

    it("should create a new shortlist if none exists and add the job", async () => {
      const mockJob = { _id: "someJobId" };
      Job.findById.mockResolvedValue(mockJob);

      Shortlist.findOne.mockResolvedValue(null);

      const mockSave = jest.fn().mockResolvedValue({
        _id: "newShortlistId",
        user: "mockUserId",
        jobs: ["someJobId"],
      });
      Shortlist.mockImplementation(() => ({
        _id: "newShortlistId", 
        user: "mockUserId",
        jobs: [],
        save: mockSave,
      }));

      await addJobToShortlist(req, res);

      expect(Shortlist.findOne).toHaveBeenCalledWith({ user: "mockUserId" });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "newShortlistId",
          user: "mockUserId",
          jobs: ["someJobId"],
        })
      );
    });

    it("should return 400 if job already in shortlist", async () => {
      const mockJob = { _id: "someJobId" };
      Job.findById.mockResolvedValue(mockJob);

      const existingShortlist = {
        _id: "shortlistId",
        user: "mockUserId",
        jobs: ["someJobId"],
        save: jest.fn(),
      };
      Shortlist.findOne.mockResolvedValue(existingShortlist);

      await addJobToShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Job already in shortlist" });
    });

    it("should return 201 if added to existing shortlist", async () => {
      const mockJob = { _id: "someJobId" };
      Job.findById.mockResolvedValue(mockJob);

      const existingShortlist = {
        _id: "shortlistId",
        user: "mockUserId",
        jobs: ["anotherJobId"],
        save: jest.fn().mockResolvedValue({
          _id: "shortlistId",
          user: "mockUserId",
          jobs: ["anotherJobId", "someJobId"],
        }),
      };
      Shortlist.findOne.mockResolvedValue(existingShortlist);

      await addJobToShortlist(req, res);

      expect(existingShortlist.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "shortlistId",
          user: "mockUserId",
          jobs: ["anotherJobId", "someJobId"],
        })
      );
    });

    it("should return 500 on DB error", async () => {
      Job.findById.mockRejectedValue(new Error("DB error"));

      await addJobToShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  // ----------------------------------------------------
  // removeJobFromShortlist
  // ----------------------------------------------------
  describe("removeJobFromShortlist", () => {
    beforeEach(() => {
      req.params.jobId = "someJobId";
    });

    it("should return 404 if shortlist not found", async () => {
      Shortlist.findOne.mockResolvedValue(null);

      await removeJobFromShortlist(req, res);

      expect(Shortlist.findOne).toHaveBeenCalledWith({ user: "mockUserId" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Shortlist not found" });
    });

    it("should return 404 if job not in shortlist", async () => {
      const mockShortlist = {
        _id: "shortlistId",
        user: "mockUserId",
        jobs: ["someOtherJobId"],
      };
      Shortlist.findOne.mockResolvedValue(mockShortlist);

      await removeJobFromShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Job not in shortlist" });
    });

    it("should remove job and return updated shortlist", async () => {
      const mockShortlistSave = jest.fn().mockResolvedValue({
        _id: "shortlistId",
        user: "mockUserId",
        jobs: ["anotherJobId"], 
      });
      const mockShortlist = {
        _id: "shortlistId",
        user: "mockUserId",
        jobs: ["someJobId", "anotherJobId"],
        save: mockShortlistSave,
      };
      Shortlist.findOne.mockResolvedValue(mockShortlist);

      await removeJobFromShortlist(req, res);

      expect(mockShortlistSave).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "shortlistId",
          user: "mockUserId",
          jobs: ["anotherJobId"],
        })
      );
    });

    it("should return 500 on DB error", async () => {
      Shortlist.findOne.mockRejectedValue(new Error("DB fail"));

      await removeJobFromShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB fail" });
    });
  });
});
