import { describe, it, expect, afterEach, vi } from 'vitest';
import * as applicationService from '../services/application.service';
import { makeApiRequest, handleApiError } from '../services/helper';

// Mock the helper functions
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
  handleApiError: vi.fn(),
}));

describe('Application Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test for lines 1-43 (getAllUserApplications, getApplicationById)
  describe('getAllUserApplications', () => {
    it('fetches all user applications successfully', async () => {
      const mockData = [{ _id: '1', title: 'App 1', status: 'Applied' }];
      makeApiRequest.mockResolvedValue(mockData);
      
      const result = await applicationService.getAllUserApplications();
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/all', 'GET');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      const error = new Error('Network error');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.getAllUserApplications()).rejects.toThrow('Network error');
    });
  });

  describe('getApplicationById', () => {
    it('fetches application by ID successfully', async () => {
      const mockData = { 
        _id: '123', 
        job: { _id: 'job1', title: 'Developer' },
        status: 'Applied'
      };
      makeApiRequest.mockResolvedValue(mockData);
      
      const result = await applicationService.getApplicationById('123');
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/byId?id=123', 'GET');
      expect(result).toEqual(mockData);
    });

    it('throws error when application ID is not found', async () => {
      const error = new Error('Application not found');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.getApplicationById('invalid-id')).rejects.toThrow('Application not found');
    });
  });

  // Test for lines 54-63 (getJobApplicants)
  describe('getJobApplicants', () => {
    it('fetches job applicants successfully', async () => {
      const mockData = [{ _id: 'user1', name: 'Applicant 1' }];
      makeApiRequest.mockResolvedValue(mockData);
      
      const result = await applicationService.getJobApplicants('job1');
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/byJobId?jobId=job1', 'GET');
      expect(result).toEqual(mockData);
    });

    it('handles API errors gracefully', async () => {
      const error = new Error('API error');
      makeApiRequest.mockRejectedValue(error);
      handleApiError.mockReturnValue({ error: true, message: 'Failed to fetch applicants' });
      
      const result = await applicationService.getJobApplicants('job1');
      
      expect(handleApiError).toHaveBeenCalledWith(error, 'Failed to fetch applicants');
      expect(result).toEqual({ error: true, message: 'Failed to fetch applicants' });
    });
  });

  // Test for lines 71-76 (applyToJob)
  describe('applyToJob', () => {
    it('creates new job application successfully', async () => {
      const applicationData = { 
        jobId: 'job1', 
        coverLetter: 'Hello', 
        answers: [{ questionId: 'q1', answerText: 'Answer 1' }] 
      };
      const mockResponse = { _id: 'app1', job: 'job1', status: 'Applying' };
      makeApiRequest.mockResolvedValue(mockResponse);
      
      const result = await applicationService.applyToJob(applicationData);
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/apply', 'POST', applicationData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when job ID is invalid', async () => {
      const error = new Error('Invalid job ID');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.applyToJob({ jobId: '' })).rejects.toThrow('Invalid job ID');
    });
  });

  // Test for lines 83-88 (withdrawApplication)
  describe('withdrawApplication', () => {
    it('withdraws application successfully', async () => {
      const mockResponse = { success: true, message: 'Application withdrawn' };
      makeApiRequest.mockResolvedValue(mockResponse);
      
      const result = await applicationService.withdrawApplication('app1');
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/withdraw?id=app1', 'DELETE');
      expect(result).toEqual(mockResponse);
    });

    it('throws error when application is not found', async () => {
      const error = new Error('Application not found');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.withdrawApplication('nonexistent')).rejects.toThrow('Application not found');
    });
  });

  // Test for lines 96-101 (getApplicationsData)
  describe('getApplicationsData', () => {
    it('fetches employer dashboard data successfully', async () => {
      const mockData = { 
        stats: { total: 10, applied: 5 },
        recentApplications: [{ _id: 'app1', status: 'Applied' }],
        graphData: { labels: ['Jan'], datasets: [] }
      };
      makeApiRequest.mockResolvedValue(mockData);
      
      const result = await applicationService.getApplicationsData();
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/data', 'GET');
      expect(result).toEqual(mockData);
    });

    it('throws error when user is not an employer', async () => {
      const error = new Error('Unauthorized role');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.getApplicationsData()).rejects.toThrow('Unauthorized role');
    });
  });

  // Test for lines 110-115 (getAssessmentDeadline)
  describe('getAssessmentDeadline', () => {
    it('fetches assessment deadline successfully', async () => {
      const mockData = { 
        deadline: '2025-04-01T00:00:00.000Z',
        hasExpired: false
      };
      makeApiRequest.mockResolvedValue(mockData);
      
      const result = await applicationService.getAssessmentDeadline('app1');
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/deadline?id=app1', 'GET');
      expect(result).toEqual(mockData);
    });

    it('throws error when application is not found', async () => {
      const error = new Error('Application not found');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.getAssessmentDeadline('invalid')).rejects.toThrow('Application not found');
    });
  });

  // Test for lines 124-133 (setAssessmentDeadline)
  describe('setAssessmentDeadline', () => {
    it('sets assessment deadline successfully', async () => {
      const deadline = '2025-04-01';
      const mockResponse = { 
        success: true,
        message: 'Assessment deadline set',
        data: { deadline: '2025-04-01T00:00:00.000Z' }
      };
      makeApiRequest.mockResolvedValue(mockResponse);
      
      const result = await applicationService.setAssessmentDeadline('app1', deadline);
      
      expect(makeApiRequest).toHaveBeenCalledWith(
        '/api/application/deadline?id=app1', 
        'PUT', 
        { deadline }
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error when deadline format is invalid', async () => {
      const error = new Error('Invalid date format');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.setAssessmentDeadline('app1', 'invalid-date')).rejects.toThrow('Invalid date format');
    });
  });

  // Test for lines 145-155 (saveApplication)
  describe('saveApplication', () => {
    it('saves application draft successfully', async () => {
      const applicationData = { 
        applicationId: 'app1', 
        jobId: 'job1', 
        coverLetter: 'Updated cover letter', 
        answers: [
          { questionId: 'q1', answerText: 'Updated answer' }
        ]
      };
      const mockResponse = {
        success: true,
        data: {
          _id: 'app1',
          job: 'job1',
          coverLetter: 'Updated cover letter',
          status: 'Applying'
        }
      };
      makeApiRequest.mockResolvedValue(mockResponse);
      
      const result = await applicationService.saveApplication(applicationData);
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/save', 'PUT', applicationData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when application ID is missing', async () => {
      const error = new Error('Invalid application data');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.saveApplication({ 
        jobId: 'job1', coverLetter: 'Cover letter' 
      })).rejects.toThrow('Invalid application data');
    });
  });

  // Test for lines 163-168 (submitApplication)
  describe('submitApplication', () => {
    it('submits application successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Application submitted successfully',
        data: { _id: 'app1', status: 'Applied' }
      };
      makeApiRequest.mockResolvedValue(mockResponse);
      
      const result = await applicationService.submitApplication('app1');
      
      expect(makeApiRequest).toHaveBeenCalledWith(
        '/api/application/submit', 
        'PUT', 
        { applicationId: 'app1' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error when application is already submitted', async () => {
      const error = new Error('Application cannot be submitted in its current state');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.submitApplication('already-submitted')).rejects.toThrow(
        'Application cannot be submitted in its current state'
      );
    });

    it('throws error when application ID is invalid', async () => {
      const error = new Error('Invalid application submission');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.submitApplication('')).rejects.toThrow('Invalid application submission');
    });
  });

  // Test updateStatus function if it exists in your service (was mentioned in line ranges)
  describe('updateStatus', () => {
    it('progresses application status successfully', async () => {
      const mockResponse = { 
        success: true, 
        message: 'Application status updated',
        data: { _id: 'app1', status: 'Shortlisted' }
      };
      makeApiRequest.mockResolvedValue(mockResponse);
      
      const result = await applicationService.updateStatus('app1', false);
      
      // Fix: Updated to include &reject=false in the URL
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/status?id=app1&reject=false', 'PUT');
      expect(result).toEqual(mockResponse);
    });
  
    it('rejects application successfully', async () => {
      const mockResponse = { 
        success: true, 
        message: 'Application rejected',
        data: { _id: 'app1', status: 'Rejected' }
      };
      makeApiRequest.mockResolvedValue(mockResponse);
      
      const result = await applicationService.updateStatus('app1', true);
      
      expect(makeApiRequest).toHaveBeenCalledWith('/api/application/status?id=app1&reject=true', 'PUT');
      expect(result).toEqual(mockResponse);
    });
  
    it('throws error when status transition is invalid', async () => {
      const error = new Error('Invalid status transition');
      makeApiRequest.mockRejectedValue(error);
      await expect(applicationService.updateStatus('app1', false)).rejects.toThrow('Invalid status transition');
    });
  });
});