import assessmentController from '../../controllers/assessment.controller.js';
import CodeAssessment from '../../models/codeAssessment.model.js';
import User from '../../models/user/user.model.js';
import Job from '../../models/job.model.js';
import Application from '../../models/application.model.js';
import CodeSubmission from '../../models/codeSubmission.model.js';

global.fetch = jest.fn();

// Mock the models
jest.mock('../../models/application.model.js');
jest.mock('../../models/codeAssessment.model.js');
jest.mock('../../models/codeSubmission.model.js');
jest.mock('../../models/job.model.js');
jest.mock('../../models/user/user.model.js');

describe('Assessment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ---------------------------------------------------
  // sendCode
  // ---------------------------------------------------
  describe('sendCode', () => {
    it('should return 400 if source_code or language is missing', async () => {
      req.body = { source_code: '', language: '' }; 
      await assessmentController.sendCode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'source_code and language are required',
      });
    });

    it('should send code successfully (200) and return data', async () => {
      req.body = {
        source_code: 'print("Hello")',
        language: 'python3',
      };

      // mock fetch success
      const mockJson = jest.fn().mockResolvedValue({ id: 'runnerId123' });
      fetch.mockResolvedValue({
        json: mockJson,
      });

      await assessmentController.sendCode(req, res);

      expect(fetch).toHaveBeenCalledWith(
        "https://paiza-io.p.rapidapi.com/runners/create",
        expect.objectContaining({
          method: "POST",
          headers: expect.any(Object),
          body: JSON.stringify({ source_code: 'print("Hello")', language: 'python3' }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Sent code successfully',
        data: { id: 'runnerId123' },
      });
    });

    it('should return 500 on internal error', async () => {
      req.body = { source_code: 'some code', language: 'python3' };
      fetch.mockRejectedValue(new Error('Fetch failed'));

      await assessmentController.sendCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        data: { error: 'Fetch failed' },
      });
    });
  });

  // ---------------------------------------------------
  // getStatus
  // ---------------------------------------------------
  describe('getStatus', () => {
    it('should return 200 with status data', async () => {
      req.query = { id: 'runnerId123' };

      const mockJson = jest.fn().mockResolvedValue({ status: 'completed' });
      fetch.mockResolvedValue({ json: mockJson });

      await assessmentController.getStatus(req, res);

      expect(fetch).toHaveBeenCalledWith(
        'https://paiza-io.p.rapidapi.com/runners/get_details?id=runnerId123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Status retrieved successfully',
        data: { status: 'completed' },
      });
    });

    it('should return 500 on error', async () => {
      req.query = { id: 'someId' };
      fetch.mockRejectedValue(new Error('Failed to fetch status'));

      await assessmentController.getStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        data: { error: 'Failed to fetch status' },
      });
    });
  });

  // ---------------------------------------------------
  // getTask
  // ---------------------------------------------------
  describe('getTask', () => {
    it('should return 400 if ids are missing', async () => {
      req.query = {};
      req.uid = 'mockUid';

      await assessmentController.getTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No id provided',
      });
    });

    it('should return 200 and task data if found', async () => {
      req.query = { appId: 'app123', taskId: 'task123' };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'user123', job: 'job123' };
      const mockAssessment = { title: 'Test Task' };
      const mockJob = { assessments: ['task123'] };

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);
      CodeAssessment.findOne.mockResolvedValue(mockAssessment);
      Job.findOne.mockResolvedValue(mockJob);
      CodeSubmission.find.mockResolvedValue([]);

      await assessmentController.getTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully retrieved assessment',
        data: { assessment: mockAssessment },
      });
    });

    it('should return 500 on error', async () => {
      req.query = { appId: 'app123', taskId: 'task123' };
      req.uid = 'mockUid';

      User.findOne.mockRejectedValue(new Error('DB error'));

      await assessmentController.getTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error: DB error',
      });
    });

    it('should handle assessment not matching job post', async () => {
      req.query = { appId: 'app123', taskId: 'task123' };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'user123', job: 'job123' };
      const mockJob = { assessments: ['different-task-id'] }; // Different task ID

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);
      CodeAssessment.findOne.mockResolvedValue({ title: 'Test Task' });
      Job.findOne.mockResolvedValue(mockJob);

      await assessmentController.getTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: 'Error: Assessment does not match the job post' 
      });
    });

    it('should handle missing assessments array in job', async () => {
      req.query = { appId: 'app123', taskId: 'task123' };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'user123', job: 'job123' };
      const mockJob = {}; // No assessments array

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);
      CodeAssessment.findOne.mockResolvedValue({ title: 'Test Task' });
      Job.findOne.mockResolvedValue(mockJob);

      await assessmentController.getTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: 'Error: Assessment does not match the job post' 
      });
    });
  });

  // ---------------------------------------------------
  // getTasksId
  // ---------------------------------------------------
  describe('getTasksId', () => {
    it('should return 400 if appId is missing', async () => {
      req.query = {};
      req.uid = 'mockUid';

      await assessmentController.getTasksId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No id provided',
      });
    });

    it('should return 200 with assessments data', async () => {
      req.query = { appId: 'app123' };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'user123', job: 'job123' };
      const mockJob = { assessments: ['task123'] };
      const mockAssessment = { _id: 'task123', title: 'Test Task' };

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);
      Job.findOne.mockResolvedValue(mockJob);
      CodeAssessment.findById.mockResolvedValue(mockAssessment);
      CodeSubmission.find.mockResolvedValue([]);

      await assessmentController.getTasksId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully retrieved assessments with status',
        data: expect.any(Array)
      });
    });

    it('should handle unauthorized user access', async () => {
      req.query = { appId: 'app123' };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'differentUserId', job: 'job123' };

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);

      await assessmentController.getTasksId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error: User not authorized'
      });
    });

    it('should handle case when no assessments required', async () => {
      req.query = { appId: 'app123' };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'user123', job: 'job123' };
      const mockJob = { assessments: [] };

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);
      Job.findOne.mockResolvedValue(mockJob);

      await assessmentController.getTasksId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error: No assessment required for this application'
      });
    });
  });

  // ---------------------------------------------------
  // submit
  // ---------------------------------------------------
  describe('submit', () => {
    it('should handle successful submission with no previous submission', async () => {
      req.body = {
        appId: 'app123',
        testsPassed: 10,
        code: 'console.log("test")',
        language: 'javascript',
        taskId: 'task123'
      };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'user123' };

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);
      CodeSubmission.findOne.mockResolvedValue(null);
      CodeSubmission.create.mockResolvedValue({});

      await assessmentController.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Submitted successfully! Code saved',
        data: { success: true, message: 'Submitted successfully! Code saved' },
      });
    });

    it('should handle unauthorized submission attempt', async () => {
      req.body = {
        appId: 'app123',
        testsPassed: 10,
        code: 'console.log("test")',
        language: 'javascript',
        taskId: 'task123'
      };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'differentUserId' };

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);

      await assessmentController.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
        data: { error: 'User not authorized' },
      });
    });

    it('should handle submissions with lower score than previous, but not saved to database', async () => {
      req.body = {
        appId: 'app123',
        testsPassed: 5,
        code: 'console.log("test")',
        language: 'javascript',
        taskId: 'task123'
      };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'user123' };
      const mockPrevSubmission = {
        score: 8,
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);
      CodeSubmission.findOne.mockResolvedValue(mockPrevSubmission);

      await assessmentController.submit(req, res);

      expect(mockPrevSubmission.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Submitted successfully! Code saved',
        data: { success: true, message: 'Not saved. Highest score: 8' },
      });
    });

    it('should update previous submission if score is higher', async () => {
      req.body = {
        appId: 'app123',
        testsPassed: 10,
        code: 'console.log("better solution")',
        language: 'javascript',
        taskId: 'task123'
      };
      req.uid = 'mockUid';

      const mockUser = { _id: 'user123' };
      const mockApp = { applicant: 'user123' };
      const mockPrevSubmission = {
        score: 5,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      Application.findOne.mockResolvedValue(mockApp);
      CodeSubmission.findOne.mockResolvedValue(mockPrevSubmission);

      await assessmentController.submit(req, res);

      expect(mockPrevSubmission.save).toHaveBeenCalled();
      expect(mockPrevSubmission.score).toBe(10);
      expect(mockPrevSubmission.solutionCode).toBe('console.log("better solution")');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Submitted successfully! Code saved',
        data: { success: true, message: 'Submitted successfully! Code saved' },
      });
    });

    it('should handle missing application data', async () => {
      req.body = {
        appId: 'app123',
        testsPassed: 10,
        code: 'console.log("test")',
        language: 'javascript',
        taskId: 'task123'
      };
      req.uid = 'mockUid';

      User.findOne.mockResolvedValue(null);
      Application.findOne.mockResolvedValue(null);

      await assessmentController.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
        data: { error: 'User not authorized' },
      });
    });

    it('should handle application access error', async () => {
      req.body = {
        appId: 'app123',
        testsPassed: 10,
        code: 'console.log("test")',
        language: 'javascript',
        taskId: 'task123'
      };
      req.uid = 'mockUid';

      User.findOne.mockRejectedValue(new Error('Database error'));

      await assessmentController.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
        data: { error: 'Database error' },
      });
    });
  });

  // ---------------------------------------------------
  // getAllTasks
  // ---------------------------------------------------
  describe('getAllTasks', () => {
    it('should return all tasks successfully', async () => {
      const mockTasks = [{ title: 'Task 1' }, { title: 'Task 2' }];
      CodeAssessment.find.mockResolvedValue(mockTasks);

      await assessmentController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully received code assessments',
        data: mockTasks
      });
    });

    it('should handle errors', async () => {
      CodeAssessment.find.mockRejectedValue(new Error('DB error'));

      await assessmentController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: 'Internal server error',
        data: { error: 'DB error' },
      });
    });
  });

  // ---------------------------------------------------
  // createAss
  // ---------------------------------------------------
  describe('createAss', () => {
    it('should create assessment successfully', async () => {
      const mockAssessment = {
        title: 'New Task',
        description: 'Test description',
        difficulty: 'medium',
        testCases: ['test1', 'test2']
      };
      req.body = mockAssessment;

      const mockSavedAssessment = { ...mockAssessment, _id: 'task123' };
      CodeAssessment.prototype.save = jest.fn().mockResolvedValue(mockSavedAssessment);

      await assessmentController.createAss(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Assessment added successfully',
        data: mockSavedAssessment
      });
    });

    it('should handle errors', async () => {
      req.body = {};
      CodeAssessment.prototype.save = jest.fn().mockRejectedValue(new Error('DB error'));

      await assessmentController.createAss(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: 'Internal server error',
        data: { error: 'DB error' },
      });
    });
  });

  describe('createAss edge cases', () => {
    it('should validate required fields', async () => {
      const incompleteMockAssessment = {
        title: 'New Task'
        // missing required fields
      };
      req.body = incompleteMockAssessment;

      const mockError = new Error('Validation error');
      CodeAssessment.prototype.save = jest.fn().mockRejectedValue(mockError);

      await assessmentController.createAss(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        success: false,
        message: 'Internal server error',
        data: { error: 'Validation error' },
      });
    });
  });
});
