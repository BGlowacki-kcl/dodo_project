// src/tests/job.service.test.jsx
import { describe, it, expect, vi, afterEach } from 'vitest';
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
} from '../services/job.service.js';
import { makeApiRequest } from '../services/helper.js';

// Mock makeApiRequest
vi.mock('../services/helper.js', () => ({
  makeApiRequest: vi.fn()
}));

describe('Job Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Existing Tests
  it('getAllJobs retrieves all jobs', async () => {
    const mockJobs = [{ id: '1', title: 'Software Engineer' }];
    makeApiRequest.mockResolvedValue(mockJobs);

    const result = await getAllJobs();

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/?deadlineValid=true', 'GET');
    expect(result).toEqual(mockJobs);
  });

  it('getJobById retrieves a job by ID', async () => {
    const mockJob = { id: '1', title: 'Software Engineer' };
    makeApiRequest.mockResolvedValue(mockJob);

    const result = await getJobById('1');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/1', 'GET');
    expect(result).toEqual(mockJob);
  });

  it('getJobById throws error on failure', async () => {
    const mockError = new Error('Not found');
    makeApiRequest.mockRejectedValue(mockError);

    await expect(getJobById('1')).rejects.toThrow('Not found');
    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/1', 'GET');
  });

  it('createJob creates a new job', async () => {
    const jobData = { title: 'Data Scientist' };
    const mockResponse = { id: '2', ...jobData };
    makeApiRequest.mockResolvedValue(mockResponse);

    const result = await createJob(jobData);

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/create', 'POST', jobData);
    expect(result).toEqual(mockResponse);
  });

  it('createJob throws error on failure', async () => {
    const jobData = { title: 'Data Scientist' };
    const mockError = new Error('Creation failed');
    makeApiRequest.mockRejectedValue(mockError);

    await expect(createJob(jobData)).rejects.toThrow('Creation failed');
  });

  it('updateJob updates an existing job', async () => {
    const jobData = { title: 'Updated Job' };
    const mockResponse = { id: '1', ...jobData };
    makeApiRequest.mockResolvedValue(mockResponse);

    const result = await updateJob('1', jobData);

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/1', 'PUT', jobData);
    expect(result).toEqual(mockResponse);
  });

  it('deleteJob deletes a job', async () => {
    const mockResponse = { success: true };
    makeApiRequest.mockResolvedValue(mockResponse);

    const result = await deleteJob('1');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/1', 'DELETE');
    expect(result).toEqual(mockResponse);
  });

  it('getJobCountByType retrieves count by type', async () => {
    makeApiRequest.mockResolvedValue(5);

    const result = await getJobCountByType('Full-Time');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/count/type?type=Full-Time', 'GET');
    expect(result).toBe(5);
  });

  it('getAllJobRoles retrieves all job roles', async () => {
    const mockRoles = ['Engineer', 'Manager'];
    makeApiRequest.mockResolvedValue(mockRoles);

    const result = await getAllJobRoles();

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/roles', 'GET');
    expect(result).toEqual(mockRoles);
  });

  it('getAllJobLocations retrieves all job locations', async () => {
    const mockLocations = ['Remote', 'New York'];
    makeApiRequest.mockResolvedValue(mockLocations);

    const result = await getAllJobLocations();

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/locations', 'GET');
    expect(result).toEqual(mockLocations);
  });

  it('getAllJobTypes retrieves all job types', async () => {
    const mockTypes = ['Full-Time', 'Part-Time'];
    makeApiRequest.mockResolvedValue(mockTypes);

    const result = await getAllJobTypes();

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/employmentType', 'GET');
    expect(result).toEqual(mockTypes);
  });

  it('getAllCompanies retrieves all companies', async () => {
    const mockCompanies = ['TechCorp', 'DataInc'];
    makeApiRequest.mockResolvedValue(mockCompanies);

    const result = await getAllCompanies();

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/company', 'GET');
    expect(result).toEqual(mockCompanies);
  });

  it('getFilteredJobs retrieves filtered jobs', async () => {
    const filters = {
      companies: ['TechCorp'],
      jobTypes: ['Full-Time'],
      locations: ['Remote'],
      titles: ['Engineer'],
      deadlineRange: '30_days',
      salaryRange: [50000, 100000]
    };
    const mockJobs = [{ id: '1', title: 'Engineer' }];
    makeApiRequest.mockResolvedValue(mockJobs);

    const result = await getFilteredJobs(filters);

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/job/search?company=TechCorp&jobType=Full-Time&location=Remote&title=Engineer&deadlineRange=30_days&salaryMin=50000&salaryMax=100000',
      'GET'
    );
    expect(result).toEqual(mockJobs);
  });

  it('getJobsByEmployer retrieves employer jobs', async () => {
    const mockJobs = [{ id: '1', title: 'Employer Job' }];
    makeApiRequest.mockResolvedValue(mockJobs);

    const result = await getJobsByEmployer();

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/employer', 'GET');
    expect(result).toEqual(mockJobs);
  });

  it('getApplicantsByJobId retrieves applicants for a job', async () => {
    const mockResponse = { data: [{ id: 'user1', name: 'John' }] };
    makeApiRequest.mockResolvedValue(mockResponse);

    const result = await getApplicantsByJobId('1');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/applicants?jobId=1', 'GET');
    expect(result).toEqual(mockResponse.data);
  });

  it('getApplicantsByJobId throws error if jobId is missing', async () => {
    await expect(getApplicantsByJobId('')).rejects.toThrow('Job ID is required');
    expect(makeApiRequest).not.toHaveBeenCalled();
  });

  it('getJobQuestionsById retrieves job questions', async () => {
    const mockQuestions = [{ id: 'q1', text: 'Question 1' }];
    makeApiRequest.mockResolvedValue(mockQuestions);

    const result = await getJobQuestionsById('1');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/questions?jobId=1', 'GET');
    expect(result).toEqual(mockQuestions);
  });

  it('getSalaryBounds retrieves salary bounds', async () => {
    const mockBounds = { minSalary: 30000, maxSalary: 150000 };
    makeApiRequest.mockResolvedValue(mockBounds);

    const result = await getSalaryBounds();

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/salary-bounds', 'GET', null, 'Failed to fetch salary bounds');
    expect(result).toEqual(mockBounds);
  });

  // Additional Tests for Better Coverage
  it('getAllJobs handles API error', async () => {
    const mockError = new Error('Server error');
    makeApiRequest.mockRejectedValue(mockError);

    await expect(getAllJobs()).rejects.toThrow('Server error');
    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/?deadlineValid=true', 'GET');
  });

  it('getJobById handles null response', async () => {
    makeApiRequest.mockResolvedValue(null);

    const result = await getJobById('1');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/1', 'GET');
    expect(result).toBeNull();
  });

  it('updateJob throws error on invalid ID', async () => {
    const mockError = new Error('Invalid ID');
    makeApiRequest.mockRejectedValue(mockError);

    await expect(updateJob('invalid', { title: 'Test' })).rejects.toThrow('Invalid ID');
    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/invalid', 'PUT', { title: 'Test' });
  });

  it('deleteJob handles 404 error', async () => {
    const mockError = new Error('Job not found');
    makeApiRequest.mockRejectedValue(mockError);

    await expect(deleteJob('999')).rejects.toThrow('Job not found');
    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/999', 'DELETE');
  });

  it('getJobCountByType handles empty response', async () => {
    makeApiRequest.mockResolvedValue(0);

    const result = await getJobCountByType('Contract');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/count/type?type=Contract', 'GET');
    expect(result).toBe(0);
  });

  it('getFilteredJobs with empty filters returns unfiltered jobs', async () => {
    const mockJobs = [{ id: '1', title: 'Engineer' }];
    makeApiRequest.mockResolvedValue(mockJobs);

    const result = await getFilteredJobs({});

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/search?', 'GET');
    expect(result).toEqual(mockJobs);
  });

  it('getFilteredJobs with partial filters', async () => {
    const filters = { titles: ['Manager'], salaryRange: [60000, 120000] };
    const mockJobs = [{ id: '2', title: 'Manager' }];
    makeApiRequest.mockResolvedValue(mockJobs);

    const result = await getFilteredJobs(filters);

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/job/search?title=Manager&salaryMin=60000&salaryMax=120000',
      'GET'
    );
    expect(result).toEqual(mockJobs);
  });

  it('getFilteredJobs handles invalid salary range', async () => {
    const filters = { salaryRange: [100000] }; // Incomplete range
    const mockJobs = [{ id: '1', title: 'Engineer' }];
    makeApiRequest.mockResolvedValue(mockJobs);

    const result = await getFilteredJobs(filters);

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/search?', 'GET'); // No salary params added
    expect(result).toEqual(mockJobs);
  });

  it('getFilteredJobs logs and throws error on failure', async () => {
    const filters = { titles: ['Engineer'] };
    const mockError = new Error('Filter error');
    makeApiRequest.mockRejectedValue(mockError);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(getFilteredJobs(filters)).rejects.toThrow('Filter error');
    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/search?title=Engineer', 'GET');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching filtered jobs:', mockError);

    consoleErrorSpy.mockRestore();
  });

  it('getApplicantsByJobId returns empty array on no data', async () => {
    makeApiRequest.mockResolvedValue({});

    const result = await getApplicantsByJobId('1');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/applicants?jobId=1', 'GET');
    expect(result).toEqual([]);
  });

  it('getApplicantsByJobId handles API error', async () => {
    const mockError = new Error('No applicants');
    makeApiRequest.mockRejectedValue(mockError);

    await expect(getApplicantsByJobId('1')).rejects.toThrow('No applicants');
    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/applicants?jobId=1', 'GET');
  });

  it('getSalaryBounds handles error', async () => {
    const mockError = new Error('Server error');
    makeApiRequest.mockRejectedValue(mockError);

    await expect(getSalaryBounds()).rejects.toThrow('Server error');
    expect(makeApiRequest).toHaveBeenCalledWith('/api/job/salary-bounds', 'GET', null, 'Failed to fetch salary bounds');
  });
});