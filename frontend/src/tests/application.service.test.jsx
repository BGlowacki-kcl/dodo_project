import { describe, it, expect, afterEach, vi } from 'vitest';
import * as applicationService from '../services/application.service'; // Simplified relative path
import { makeApiRequest, handleApiError } from '../services/helper';

// Mock the helper functions
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
  handleApiError: vi.fn(),
}));

// Mock fetch if needed (remove if helper.js doesn’t use fetch)
global.fetch = vi.fn();

describe('Application Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUserApplications', () => {
    it('fetches all user applications successfully', async () => {
      const mockData = [{ id: '1', title: 'App 1' }];
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.getAllUserApplications();
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/all', 'GET');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Network error');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.getAllUserApplications()).rejects.toThrow(error);
    });
  });

  describe('getApplicationById', () => {
    it('fetches application by ID successfully', async () => {
      const mockData = { id: '123', title: 'App' };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.getApplicationById('123');
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/byId?id=123', 'GET');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Not found');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.getApplicationById('123')).rejects.toThrow(error);
    });
  });

  describe('getJobApplicants', () => {
    it('fetches job applicants successfully', async () => {
      const mockData = [{ id: '1', name: 'Applicant' }];
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.getJobApplicants('job1');
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/byJobId?jobId=job1', 'GET');
      expect(result).toEqual(mockData);
    });

    it('handles error with handleApiError', async () => {
      const error = new Error('API error');
      const errorResponse = { error: 'Failed' };
      makeApiRequest.mockRejectedValue(error);
      handleApiError.mockReturnValue(errorResponse);
      const result = await applicationService.getJobApplicants('job1');
      expect(handleApiError).toHaveBeenCalledWith(error, 'Failed to fetch applicants');
      expect(result).toEqual(errorResponse);
    });
  });

  describe('applyToJob', () => {
    it('submits job application successfully', async () => {
      const applicationData = { jobId: 'job1', coverLetter: 'Hello', answers: ['ans1'] };
      const mockData = { id: 'app1', ...applicationData };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.applyToJob(applicationData);
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/apply', 'POST', applicationData);
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Submission failed');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.applyToJob({ jobId: 'job1' })).rejects.toThrow(error);
    });
  });

  describe('withdrawApplication', () => {
    it('withdraws application successfully', async () => {
      const mockData = 'Application withdrawn';
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.withdrawApplication('app1');
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/withdraw?id=app1', 'DELETE');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Withdraw failed');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.withdrawApplication('app1')).rejects.toThrow(error);
    });
  });

  describe('getApplicationsData', () => {
    it('fetches applications data successfully', async () => {
      const mockData = { stats: { total: 10 } };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.getApplicationsData();
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/data', 'GET');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Data fetch failed');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.getApplicationsData()).rejects.toThrow(error);
    });
  });

  describe('getAssessmentDeadline', () => {
    it('fetches assessment deadline successfully', async () => {
      const mockData = { deadline: '2025-04-01' };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.getAssessmentDeadline('app1');
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/deadline?id=app1', 'GET');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Deadline fetch failed');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.getAssessmentDeadline('app1')).rejects.toThrow(error);
    });
  });

  describe('setAssessmentDeadline', () => {
    it('sets assessment deadline successfully', async () => {
      const mockData = { deadline: '2025-04-01' };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.setAssessmentDeadline('app1', '2025-04-01');
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/deadline?id=app1', 'PUT', { deadline: '2025-04-01' });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Set deadline failed');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.setAssessmentDeadline('app1', '2025-04-01')).rejects.toThrow(error);
    });
  });

  describe('updateStatus', () => {
    it('updates status to approve successfully', async () => {
      const mockData = { id: 'app1', status: 'approved' };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.updateStatus('app1', false);
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/status?id=app1', 'PUT');
      expect(result).toEqual(mockData);
    });

    it('updates status to reject successfully', async () => {
      const mockData = { id: 'app1', status: 'rejected' };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.updateStatus('app1', true);
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/status?id=app1&reject=true', 'PUT');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Status update failed');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.updateStatus('app1', false)).rejects.toThrow(error);
    });
  });

  describe('saveApplication', () => {
    it('saves application draft successfully', async () => {
      const applicationData = { applicationId: 'app1', jobId: 'job1', coverLetter: 'Hello', answers: ['ans1'] };
      const mockData = { id: 'app1', ...applicationData };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.saveApplication(applicationData);
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/save', 'PUT', applicationData);
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Save failed');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.saveApplication({ applicationId: 'app1' })).rejects.toThrow(error);
    });
  });

  describe('submitApplication', () => {
    it('submits drafted application successfully', async () => {
      const mockData = { id: 'app1', status: 'submitted' };
      makeApiRequest.mockResolvedValue(mockData);
      const result = await applicationService.submitApplication('app1');
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/submit', 'PUT', { applicationId: 'app1' });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Submit failed');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.submitApplication('app1')).rejects.toThrow(error);
    });
  });
});