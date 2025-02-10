import Job from '../../models/job.model.js';
import * as jobController from '../../controllers/job.controller.js';

jest.mock('../../models/job.model.js');

describe('Job Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createJob', () => {
        it('should create a job and return 201 status', async () => {
            const jobData = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'Remote',
                description: 'Develop awesome software',
                salaryRange: '100k-120k',
                employmentType: 'Full-time',
                requirements: ['JavaScript', 'Node.js'],
                experienceLevel: 'Mid-level',
                postedBy: '12345'
            };

            req.body = jobData;
            Job.prototype.save = jest.fn().mockResolvedValue(jobData);

            await jobController.createJob(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(jobData);
        });

        it('should return 400 status if required fields are missing', async () => {
            req.body = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'Remote'
            };

            await jobController.createJob(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'All required fields must be filled.' });
        });
    });

    describe('getJobs', () => {
        it('should return all jobs with 200 status', async () => {
            const jobs = [
                { title: 'Software Engineer', company: 'Tech Corp' },
                { title: 'Data Scientist', company: 'Data Inc' }
            ];

            Job.find = jest.fn().mockResolvedValue(jobs);

            await jobController.getJobs(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(jobs);
        });
    });

    describe('getJobById', () => {
        it('should return a job by id with 200 status', async () => {
            const job = { title: 'Software Engineer', company: 'Tech Corp' };
            req.params.id = '12345';

            Job.findById = jest.fn().mockResolvedValue(job);

            await jobController.getJobById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(job);
        });

        it('should return 404 status if job is not found', async () => {
            req.params.id = '12345';
            Job.findById = jest.fn().mockResolvedValue(null);

            await jobController.getJobById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
        });
    });

    describe('updateJob', () => {
        it('should update a job and return 200 status', async () => {
            const updatedJob = { title: 'Updated Software Engineer', company: 'Tech Corp' };
            req.params.id = '12345';
            req.body = updatedJob;

            Job.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedJob);

            await jobController.updateJob(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedJob);
        });

        it('should return 404 status if job is not found', async () => {
            req.params.id = '12345';
            req.body = { title: 'Updated Software Engineer' };
            Job.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

            await jobController.updateJob(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
        });
    });

    describe('deleteJob', () => {
        it('should delete a job and return 200 status', async () => {
            const job = { title: 'Software Engineer', company: 'Tech Corp' };
            req.params.id = '12345';

            Job.findById = jest.fn().mockResolvedValue(job);
            Job.prototype.remove = jest.fn().mockResolvedValue(true);

            await jobController.deleteJob(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Job deleted successfully' });
        });

        it('should return 404 status if job is not found', async () => {
            req.params.id = '12345';
            Job.findById = jest.fn().mockResolvedValue(null);

            await jobController.deleteJob(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
        });
    });

});