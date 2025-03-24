import Job from '../../models/job.model.js';
import { Employer } from '../../models/user/Employer.model.js';
import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobCountByType,
    getAllJobRoles,
    getAllJobLocations,
    getAllJobTypes,
    getFilteredJobs
} from '../../controllers/job.controller.js';

jest.mock('../../models/job.model.js');
jest.mock('../../models/user/Employer.model.js');

describe('Job Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            uid: 'mockUid'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createJob', () => {
        it('should create a job and return 201 status', async () => {
            const mockJob = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'Remote',
                description: 'Develop awesome software',
                postedBy: '12345',
                _id: 'fakeJobId'
            };

            req.body = mockJob;
            Job.prototype.save = jest.fn().mockResolvedValue(mockJob);

            await createJob(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Job created successfully',
                data: mockJob
            });
        });

        it('should return 400 status if required fields are missing', async () => {
            req.body = {
                title: 'Software Engineer'
                // missing required fields
            };

            await createJob(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'All required fields must be filled.'
            });
        });
    });

    describe('getJobs', () => {
        it('should return all jobs with 200 status', async () => {
            const mockJobs = [
                { title: 'Software Engineer', company: 'Tech Corp' },
                { title: 'Data Scientist', company: 'Data Inc' }
            ];

            Job.find.mockResolvedValue(mockJobs);

            await getJobs(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Jobs retrieved successfully',
                data: mockJobs
            });
        });
    });

    describe('getJobById', () => {
        it('should return a job by id with 200 status', async () => {
            const job = { title: 'Software Engineer', company: 'Tech Corp' };
            req.params.id = '12345';

            Job.findById.mockResolvedValue(job);

            await getJobById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Job retrieved successfully',
                data: job
            });
        });

        it('should return 404 status if job is not found', async () => {
            req.params.id = '12345';
            Job.findById.mockResolvedValue(null);

            await getJobById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Job not found'
            });
        });

        it('should return 500 on DB error', async () => {
            req.params.id = 'errorId';
            Job.findById.mockRejectedValue(new Error("DB error"));

            await getJobById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "DB error"
            });
        });
    });

    describe('updateJob', () => {
        it('should update a job and return 200 status', async () => {
            const updatedJob = { title: 'Updated Software Engineer', company: 'Tech Corp' };
            req.params.id = '12345';
            req.body = updatedJob;

            Job.findByIdAndUpdate.mockResolvedValue(updatedJob);

            await updateJob(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Job updated successfully',
                data: updatedJob
            });
        });

        it('should return 404 status if job is not found', async () => {
            req.params.id = '12345';
            req.body = { title: 'Updated Software Engineer' };
            Job.findByIdAndUpdate.mockResolvedValue(null);

            await updateJob(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Job not found'
            });
        });

        it('should return 500 on DB error', async () => {
            req.params.id = 'errorId';
            req.body = { title: 'anything' };
            Job.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

            await updateJob(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "DB error"
            });
        });
    });

    describe('deleteJob', () => {
        it('should delete a job and return 200 status', async () => {
            const job = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                deleteOne: jest.fn().mockResolvedValue(true) // mocking instance method
            };
            req.params.id = '12345';

            Job.findById.mockResolvedValue(job);

            await deleteJob(req, res);

            expect(job.deleteOne).toHaveBeenCalled(); // confirm call job.deleteOne()
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Job deleted successfully'
            });
        });

        it('should return 404 status if job is not found', async () => {
            req.params.id = '12345';
            Job.findById.mockResolvedValue(null);

            await deleteJob(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Job not found'
            });
        });

        it('should return 500 if db error', async () => {
            req.params.id = 'errorId';
            Job.findById.mockRejectedValue(new Error("DB error"));

            await deleteJob(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "DB error"
            });
        });
    });

    describe("getJobCountByType", () => {
        it("should return the count of jobs by type", async () => {
            req.query.type = "Full-time";
            Job.countDocuments.mockResolvedValue(5);

            await getJobCountByType(req, res);

            expect(Job.countDocuments).toHaveBeenCalledWith({ employmentType: "Full-time" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Job count retrieved successfully',
                data: 5
            });
        });

        it("should return 500 on db error", async () => {
            req.query.type = "Full-time";
            Job.countDocuments.mockRejectedValue(new Error("DB error"));

            await getJobCountByType(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "DB error"
            });
        });
    });

    describe("getAllJobRoles", () => {
        it("should return distinct titles array", async () => {
            const titles = ["Software Engineer", "Data Scientist"];
            Job.distinct.mockResolvedValue(titles);

            await getAllJobRoles(req, res);

            expect(Job.distinct).toHaveBeenCalledWith("title");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Job roles retrieved successfully',
                data: titles
            });
        });

        it("should return 500 on db error", async () => {
            Job.distinct.mockRejectedValue(new Error("DB error"));

            await getAllJobRoles(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: "Failed to fetch job roles",
                error: "DB error"
            }));
        });
    });

    describe("getAllJobLocations", () => {
        it("should return distinct locations array", async () => {
            const locs = ["Remote", "San Francisco"];
            Job.distinct.mockResolvedValue(locs);

            await getAllJobLocations(req, res);

            expect(Job.distinct).toHaveBeenCalledWith("location");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Job locations retrieved successfully',
                data: locs
            });
        });

        it("should return 500 on db error", async () => {
            Job.distinct.mockRejectedValue(new Error("DB error"));

            await getAllJobLocations(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: "Failed to fetch job locations",
                error: "DB error"
            }));
        });
    });

    describe("getAllJobTypes", () => {
        it("should return distinct employmentType array", async () => {
            const types = ["Full-time", "Part-time"];
            Job.distinct.mockResolvedValue(types);

            await getAllJobTypes(req, res);

            expect(Job.distinct).toHaveBeenCalledWith("employmentType");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Job types retrieved successfully',
                data: types
            });
        });

        it("should return 500 on db error", async () => {
            Job.distinct.mockRejectedValue(new Error("DB error"));

            await getAllJobTypes(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: "Failed to fetch job types",
                error: "DB error"
            }));
        });
    });

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

            await getFilteredJobs(req, res);

            expect(Job.find).toHaveBeenCalledWith({
                employmentType: "Full-time",
                location: "Remote",
                title: "Software Engineer"
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Jobs retrieved successfully',
                data: mockFilteredJobs
            });
        });

        it("should handle multiple array filters if they exist", async () => {
            req.query = {
                jobType: ["Full-time", "Part-time"],
                location: ["Remote", "Onsite"],
                role: ["Data Scientist", "Backend Engineer"]
            };
            const mockJobs = [{ title: "Data Scientist", location: "Remote" }];

            Job.find.mockResolvedValue(mockJobs);

            await getFilteredJobs(req, res);

            expect(Job.find).toHaveBeenCalledWith({
                employmentType: { $in: ["Full-time", "Part-time"] },
                location: { $in: ["Remote", "Onsite"] },
                title: { $in: ["Data Scientist", "Backend Engineer"] }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Jobs retrieved successfully',
                data: mockJobs
            });
        });

        it("should return 500 if an error occurs", async () => {
            Job.find.mockRejectedValue(new Error("DB error"));

            await getFilteredJobs(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: "Failed to fetch jobs",
                error: "DB error"
            }));
        });
    });
});
