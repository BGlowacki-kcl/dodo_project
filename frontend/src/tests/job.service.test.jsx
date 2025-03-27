import { describe, it, expect, vi } from 'vitest';
import { 
  getAllJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob, 
  getJobCountByType, 
  getAllJobRoles, 
  getAllJobLocations, 
  getAllJobTypes, 
  getAllCompanies, 
  getFilteredJobs, 
  getJobsByEmployer, 
  getApplicantsByJobId, 
  getJobQuestionsById,
  getSalaryBounds 
} from '../services/job.service';
import { makeApiRequest } from '../services/helper';

// Mock the helper module
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
}));

describe('Job Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('getAllJobs', () => {
    it('fetches all jobs successfully', async () => {
      const mockResponse = [{ id: '1', title: 'Job 1' }];
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getAllJobs();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job?deadlineValid=true', 'GET', null, 'Failed to fetch all jobs');
      expect(result).toEqual(mockResponse);
    });

    it('handles errors', async () => {
      const error = new Error('Fetch error');
      makeApiRequest.mockRejectedValue(error);

      await expect(getAllJobs()).rejects.toThrow('Fetch error');
    });
  });

  describe('getJobById', () => {
    it('fetches job by ID successfully', async () => {
      const mockResponse = { id: '123', title: 'Test Job' };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getJobById('123');

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/123', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Not found');
      makeApiRequest.mockRejectedValue(error);

      await expect(getJobById('123')).rejects.toThrow('Not found');
    });
  });

  describe('createJob', () => {
    it('creates job successfully', async () => {
      const jobData = { title: 'New Job' };
      const mockResponse = { id: '456', ...jobData };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await createJob(jobData);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/create', 'POST', jobData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Creation failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(createJob({ title: 'New Job' })).rejects.toThrow('Creation failed');
    });
  });

  describe('updateJob', () => {
    it('updates job successfully', async () => {
      const jobData = { title: 'Updated Job' };
      const mockResponse = { id: '789', ...jobData };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await updateJob('789', jobData);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/789', 'PUT', jobData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Update failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(updateJob('789', { title: 'Updated Job' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteJob', () => {
    it('deletes job successfully', async () => {
      const mockResponse = { success: true };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await deleteJob('123');

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/123', 'DELETE');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Delete failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(deleteJob('123')).rejects.toThrow('Delete failed');
    });
  });

  describe('getJobCountByType', () => {
    it('fetches job count successfully', async () => {
      const mockResponse = 5;
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getJobCountByType('full-time');

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/count/type?type=full-time', 'GET');
      expect(result).toBe(5);
    });

    it('throws error on failure', async () => {
      const error = new Error('Count failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getJobCountByType('full-time')).rejects.toThrow('Count failed');
    });
  });

  describe('getAllJobRoles', () => {
    it('fetches all job roles successfully', async () => {
      const mockResponse = ['Developer', 'Manager'];
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getAllJobRoles();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/roles', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Roles fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getAllJobRoles()).rejects.toThrow('Roles fetch failed');
    });
  });

  describe('getAllJobLocations', () => {
    it('fetches all job locations successfully', async () => {
      const mockResponse = ['Remote', 'On-site'];
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getAllJobLocations();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/locations', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Locations fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getAllJobLocations()).rejects.toThrow('Locations fetch failed');
    });
  });

  describe('getAllJobTypes', () => {
    it('fetches all job types successfully', async () => {
      const mockResponse = ['Full-time', 'Part-time'];
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getAllJobTypes();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/employmentType', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Types fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getAllJobTypes()).rejects.toThrow('Types fetch failed');
    });
  });

  describe('getAllCompanies', () => {
    it('fetches all companies successfully', async () => {
      const mockResponse = ['Company A', 'Company B'];
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getAllCompanies();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/company', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Companies fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getAllCompanies()).rejects.toThrow('Companies fetch failed');
    });
  });

  describe('getFilteredJobs', () => {
    it('fetches filtered jobs successfully', async () => {
      const filters = { jobType: ['full-time'], location: ['remote'] };
      const mockResponse = [{ id: '1', title: 'Filtered Job' }];
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getFilteredJobs(filters);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/search?jobType=full-time&location=remote', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Filter fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getFilteredJobs({})).rejects.toThrow('Filter fetch failed');
    });
  });

  describe('getJobsByEmployer', () => {
    it('fetches employer jobs successfully', async () => {
      const mockResponse = [{ id: '1', title: 'Employer Job' }];
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getJobsByEmployer();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/employer', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Employer jobs fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getJobsByEmployer()).rejects.toThrow('Employer jobs fetch failed');
    });
  });

  describe('getApplicantsByJobId', () => {
    it('fetches applicants successfully', async () => {
      const mockResponse = { data: [{ id: '1', name: 'Applicant' }] };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getApplicantsByJobId('123');

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/applicants?jobId=123', 'GET');
      expect(result).toEqual([{ id: '1', name: 'Applicant' }]);
    });

    it('returns empty array if no data', async () => {
      makeApiRequest.mockResolvedValue({});

      const result = await getApplicantsByJobId('123');

      expect(result).toEqual([]);
    });

    it('throws error on missing jobId', async () => {
      await expect(getApplicantsByJobId('')).rejects.toThrow('Job ID is required');
      expect(makeApiRequest).not.toHaveBeenCalled();
    });

    it('throws error on failure', async () => {
      const error = new Error('Applicants fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getApplicantsByJobId('123')).rejects.toThrow('Applicants fetch failed');
    });
  });

  describe('getJobQuestionsById', () => {
    it('fetches job questions successfully', async () => {
      const mockResponse = ['Question 1', 'Question 2'];
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getJobQuestionsById('123');

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/questions?jobId=123', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Questions fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getJobQuestionsById('123')).rejects.toThrow('Questions fetch failed');
    });
  });

  describe('getSalaryBounds', () => {
    it('fetches salary bounds successfully', async () => {
      const mockResponse = { minSalary: 30000, maxSalary: 100000 };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getSalaryBounds();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/job/salary-bounds', 'GET', null, 'Failed to fetch salary bounds');
      expect(result).toEqual(mockResponse);
    });

    it('handles errors', async () => {
      const error = new Error('Salary bounds fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(getSalaryBounds()).rejects.toThrow('Salary bounds fetch failed');
    });
  });
});