import { describe, it, expect, afterEach, vi } from 'vitest';
import { assessmentService } from '../services/assessment.service'; // Only import the exported object
import { makeApiRequest } from '../services/helper';

// Mock the helper module
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
}));

describe('Assessment Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('assessmentService.runCode', () => {
    it('runs code successfully', async () => {
      const mockSendResponse = { id: 'exec123' };
      const mockPollResponse = { status: 'completed', result: 'output' };
      makeApiRequest
        .mockResolvedValueOnce(mockSendResponse) // For sendCode
        .mockResolvedValueOnce(mockPollResponse); // For pollExecutionResults
      const result = await assessmentService.runCode(
        'x => x * 2',
        'javascript',
        [{ input: [1], output: [2] }],
        ''
      );
      expect(makeApiRequest).toHaveBeenCalledWith(
        '/api/assessment/send',
        'POST',
        expect.objectContaining({ source_code: expect.stringContaining('x => x * 2') })
      );
      expect(result).toEqual(mockPollResponse);
    });

    it('rejects code with output statements', async () => {
      const result = await assessmentService.runCode(
        'console.log("Hi")',
        'javascript',
        [],
        ''
      );
      expect(result).toEqual({ stderr: 'You cannot use output statement in your code' });
      expect(makeApiRequest).not.toHaveBeenCalled();
    });

    it('handles failed code submission', async () => {
      makeApiRequest.mockResolvedValue({}); // No id in response
      const result = await assessmentService.runCode(
        'x => x',
        'javascript',
        [],
        ''
      );
      expect(result).toEqual({ stderr: 'Failed to submit code for execution' });
    });

    it('handles API error during execution', async () => {
      makeApiRequest
        .mockResolvedValueOnce({ id: 'exec123' })
        .mockResolvedValueOnce({ status: 'error', error: 'Execution failed' });
      const result = await assessmentService.runCode(
        'x => x',
        'javascript',
        [{ input: [1], output: [2] }],
        ''
      );
      expect(result).toEqual({ status: 'error', error: 'Execution failed' });
    });
  });

  describe('assessmentService.getTask', () => {
    it('fetches task successfully', async () => {
      const mockResponse = { task: 'details' };
      makeApiRequest.mockResolvedValue(mockResponse);
      const result = await assessmentService.getTask('app1', 'task1');
      expect(makeApiRequest).toHaveBeenCalledWith(
        '/api/assessment/task?appId=app1&taskId=task1',
        'GET'
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles API errors', async () => {
      const error = new Error('Not found');
      makeApiRequest.mockRejectedValue(error);
      await expect(assessmentService.getTask('app1', 'task1')).rejects.toThrow('Not found');
    });
  });

  describe('assessmentService.getTasksId', () => {
    it('fetches task IDs successfully', async () => {
      const mockResponse = { ids: ['task1', 'task2'] };
      makeApiRequest.mockResolvedValue(mockResponse);
      const result = await assessmentService.getTasksId('app1');
      expect(makeApiRequest).toHaveBeenCalledWith(
        '/api/assessment/tasksid?appId=app1',
        'GET'
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles API errors', async () => {
      const error = new Error('Server error');
      makeApiRequest.mockRejectedValue(error);
      await expect(assessmentService.getTasksId('app1')).rejects.toThrow('Server error');
    });
  });

  describe('assessmentService.getAllTasks', () => {
    it('fetches all tasks successfully', async () => {
      const mockResponse = { tasks: ['task1', 'task2'] };
      makeApiRequest.mockResolvedValue(mockResponse);
      const result = await assessmentService.getAllTasks();
      expect(makeApiRequest).toHaveBeenCalledWith('/api/assessment/alltasks', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('handles API errors', async () => {
      const error = new Error('Not found');
      makeApiRequest.mockRejectedValue(error);
      await expect(assessmentService.getAllTasks()).rejects.toThrow('Not found');
    });
  });

  describe('assessmentService.submit', () => {
    it('submits assessment successfully', async () => {
      const mockResponse = { message: 'Submitted' };
      makeApiRequest.mockResolvedValue(mockResponse);
      const result = await assessmentService.submit('app1', true, 'code', 'python', 'task1');
      expect(makeApiRequest).toHaveBeenCalledWith('/api/assessment/submit', 'POST', {
        appId: 'app1',
        testsPassed: true,
        code: 'code',
        language: 'python',
        taskId: 'task1',
      });
      expect(result).toEqual({ success: true, message: 'Submitted' });
    });

    it('handles submission failure', async () => {
      const error = new Error('Server error');
      makeApiRequest.mockRejectedValue(error);
      const result = await assessmentService.submit('app1', false, 'code', 'javascript', 'task1');
      expect(result).toEqual({ success: false, message: 'Server error' });
    });
  });
});