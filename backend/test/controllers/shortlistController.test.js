import { getShortlist, addJobToShortlist, removeJobFromShortlist, createShortlist } from "../../controllers/shortlist.controller.js";
import Shortlist from "../../models/shortlist.model.js";
import Job from "../../models/job.model.js";
import User from "../../models/user/user.model.js";

jest.mock("../../models/shortlist.model.js");
jest.mock("../../models/job.model.js");
jest.mock("../../models/user/user.model.js");

describe("Shortlist Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      uid: "mockUserId",
      params: {},
      body: {},
      query: {},
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
      Shortlist.findOne = jest.fn().mockReturnValue(null);

      await getShortlist(req, res);

      expect(Shortlist.findOne).toHaveBeenCalledWith({ user: "mockUserId" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shortlist not found",
      });
    });

    it("should return the shortlist if found", async () => {
      const mockShortlist = {
        _id: "shortlistId",
        jobs: [],
      };
      
      Shortlist.findOne = jest.fn().mockResolvedValue(mockShortlist);

      await getShortlist(req, res);

      expect(Shortlist.findOne).toHaveBeenCalledWith({ user: "mockUserId" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockShortlist,
      });
    });
  });

  // ----------------------------------------------------
  // addJobToShortlist
  // ----------------------------------------------------
  describe("addJobToShortlist", () => {
    beforeEach(() => {
      req.query = { jobid: "someJobId" };
    });

    it("should return 404 if job not found", async () => {
      Job.findById.mockResolvedValue(null);

      await addJobToShortlist(req, res);

      expect(Job.findById).toHaveBeenCalledWith("someJobId");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Job not found",
      });
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
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Job already in shortlist",
      });
    });

    it("should return 500 if verifyJobExists throws an error", async () => {
      req.query = { jobid: "someJobId" };
      Job.findById.mockRejectedValue(new Error("DB error"));

      await addJobToShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB error",
      });
    });

    it("should return 500 if getOrCreateShortlist throws an error", async () => {
      req.query = { jobid: "someJobId" };
      Job.findById.mockResolvedValue({ _id: "someJobId" });
      Shortlist.findOne.mockRejectedValue(new Error("DB error"));

      await addJobToShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB error",
      });
    });
  });

  // ----------------------------------------------------
  // removeJobFromShortlist
  // ----------------------------------------------------
  describe("removeJobFromShortlist", () => {
    beforeEach(() => {
      req.params = { jobId: "someJobId" };
    });

    it("should return 404 if shortlist not found", async () => {
      Shortlist.findOne = jest.fn().mockResolvedValue(null);

      await removeJobFromShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shortlist not found"
      });
    });

    it("should return 404 if job not in shortlist", async () => {
      const mockShortlist = {
        _id: "shortlistId",
        user: "mockUserId",
        jobs: ["differentJobId"],
        save: jest.fn()
      };
      
      Shortlist.findOne.mockResolvedValue(mockShortlist);

      await removeJobFromShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Job not in shortlist"
      });
    });

    it("should remove job and return updated shortlist", async () => {
      const updatedShortlist = {
        _id: "shortlistId",
        user: "mockUserId",
        jobs: ["anotherJobId"]
      };

      const mockShortlist = {
        _id: "shortlistId",
        user: "mockUserId",
        jobs: ["someJobId", "anotherJobId"],
        save: jest.fn().mockResolvedValue(updatedShortlist)
      };
      
      Shortlist.findOne = jest.fn().mockResolvedValue(mockShortlist);

      await removeJobFromShortlist(req, res);

      expect(mockShortlist.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedShortlist
      });
    });

    it("should return 500 on DB error", async () => {
      Shortlist.findOne = jest.fn().mockRejectedValue(new Error("DB fail"));

      await removeJobFromShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB fail"
      });
    });
  });

  // ----------------------------------------------------
  // createShortlist
  // ----------------------------------------------------
  describe("createShortlist", () => {
    it("should create a new shortlist for a valid user", async () => {
      User.findOne.mockResolvedValue({ _id: "mockUserId" });
      Shortlist.create.mockResolvedValue({ _id: "shortlistId", user: "mockUserId", jobs: [] });

      await createShortlist(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ uid: "mockUserId" });
      expect(Shortlist.create).toHaveBeenCalledWith({ user: "mockUserId", jobs: [] });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { _id: "shortlistId", user: "mockUserId", jobs: [] },
      });
    });

    it("should return 404 if user is not found", async () => {
      User.findOne.mockResolvedValue(null);

      await createShortlist(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ uid: "mockUserId" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should return 500 on database error", async () => {
      User.findOne.mockRejectedValue(new Error("DB error"));

      await createShortlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB error",
      });
    });
  });
});
